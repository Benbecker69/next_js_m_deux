# API mobile — `/api/mobile/v1`

Ce document décrit l'API HTTP que l'application mobile Expo
([dépôt séparé](https://github.com/Benbecker69/react_native_eemi)) utilise pour
réutiliser le backend du site : routes, authentification, format d'erreur,
règles métier et limites.

Documents liés : [rendu, données et mutations](choix-de-rendu.md) ·
[authentification et sécurité](authentification-et-securite.md) ·
[base de données](base-de-donnees.md).

## Pourquoi des Route Handlers (et pas des Server Actions)

Le cahier des charges demande de justifier chaque Route Handler.

- **Le client n'est pas un navigateur.** Une app native n'a ni cookies Next, ni
  formulaires, ni rendu React : elle parle HTTP/JSON avec un jeton dans l'en-tête
  `Authorization`.
- **Un Route Handler est un contrat HTTP explicite** (méthode, URL, statuts, JSON).
  Une Server Action est un point d'entrée interne à Next.js, lié au rendu et à des
  identifiants générés : ce n'est pas une API qu'un client tiers peut appeler
  de façon stable.
- **Le cookie du site ne convient pas à un téléphone.** Un cookie est géré par
  le navigateur (attributs `httpOnly`, `sameSite`, domaine) ; une application
  native n'en a pas l'usage et envoie son jeton elle-même, dans un en-tête.
  L'API mobile a donc son propre jeton et sa propre table de sessions (voir plus
  bas), indépendants de la session du site (`src/lib/auth/session.ts`). Les
  deux reposent sur le même principe : un jeton aléatoire, dont seule
  l'empreinte est en base.

## Authentification

- `POST /auth/register` ou `POST /auth/login` renvoie un **jeton opaque**
  (`rpm_…`, 256 bits aléatoires) et sa date d'expiration (14 jours).
- Toutes les autres routes (sauf `/health`) exigent `Authorization: Bearer <jeton>`.
- Seule l'**empreinte SHA-256** du jeton est stockée (table `mobile_sessions`) :
  une base volée ne permet pas d'usurper un téléphone.
- `POST /auth/logout` **révoque** la session côté serveur : le jeton cesse de
  fonctionner même s'il a été copié. Plusieurs appareils = plusieurs sessions
  indépendantes.
- Un `401` (jeton absent, inconnu, révoqué ou expiré) signifie « reconnecte-toi ».
- La connexion est freinée après 10 échecs en 10 minutes pour une même adresse
  e-mail (`429`), en mémoire du processus (voir « Limites connues »).

## Routes

| Route                              | Auth | Entrée                                                 | Réponse                            |
| ---------------------------------- | ---- | ------------------------------------------------------ | ---------------------------------- |
| `GET /health`                      | non  | —                                                      | `{ status, api, version, time }`   |
| `POST /auth/register`              | non  | `{ name, email, password, deviceName? }`               | `201 { token, expiresAt, user }`   |
| `POST /auth/login`                 | non  | `{ email, password, deviceName? }`                     | `{ token, expiresAt, user }`       |
| `POST /auth/logout`                | oui  | —                                                      | `204`                              |
| `GET /me`                          | oui  | —                                                      | `{ user }`                         |
| `PATCH /me`                        | oui  | `{ name, memberType }`                                 | `{ user }`                         |
| `POST /me/password`                | oui  | `{ currentPassword, newPassword }`                     | `204`                              |
| `POST /me/email`                   | oui  | `{ currentPassword, email }`                           | `{ user }`                         |
| `GET /me/summary`                  | oui  | —                                                      | `{ summary }`                      |
| `GET /spaces/nearby`               | oui  | `lat, lng, startAt?, endAt?, limit?, includeBusy?`     | `{ slot, hasPosition, items[] }`   |
| `GET /spaces/{id}/availability`    | oui  | `from?, to?` (ISO, défaut maintenant→+7j)              | `{ space, location, busySlots[] }` |
| `GET /reservations`                | oui  | `scope=upcoming\|past\|all, limit, cursor`             | `{ items[], nextCursor }`          |
| `POST /reservations`               | oui  | `{ spaceId, startAt, endAt }`                          | `201 { reservation, credits }`     |
| `GET /reservations/{id}`           | oui  | —                                                      | `{ reservation }`                  |
| `POST /reservations/{id}/cancel`   | oui  | —                                                      | `{ reservation, credits }`         |
| `POST /reservations/{id}/check-in` | oui  | `{ lat, lng, accuracyM, capturedAt, scannedSpaceId? }` | `201 { checkIn, radiusM }`         |
| `GET /check-ins`                   | oui  | `limit, cursor`                                        | `{ items[], nextCursor }`          |

Conventions : dates en ISO 8601 UTC (`2026-09-21T10:00:00.000Z`) ; pagination par
curseur (`nextCursor` est `null` en fin de liste) ; réponses jamais mises en cache
(`Cache-Control: no-store`) ; aucune ligne de base de données n'est renvoyée
telle quelle, seulement les formes de `src/lib/mobile/dto.ts`.

`GET /spaces/nearby` sans `lat`/`lng` reste utile : la liste est triée par ordre
alphabétique (`hasPosition: false`, `distanceM: null`), ce qui permet à l'app de
fonctionner quand l'utilisateur refuse la permission de position.

Par défaut la liste ne contient que les espaces **libres** sur le créneau. Avec
`includeBusy=true`, les espaces déjà pris restent dans la liste (`busy: true`, sinon
`false`) : c'est ce qui permet à l'écran « Réserver » de tous les afficher et de les
chercher par nom. `limit` va jusqu'à 30.

`GET /spaces/{id}/availability` sert l'écran « choisir un espace et un créneau
précis » : l'espace, son lieu, et les créneaux déjà pris (`busySlots`, uniquement
`startAt`/`endAt` — aucune autre réservation n'est identifiable). Période bornée à
30 jours. `404 SPACE_NOT_FOUND` si l'espace n'existe pas ou n'est plus actif.

`PATCH /me` modifie le profil : mêmes informations (`name`, `memberType`) et
même appel `updateUser` que l'onglet « Profil » du site
(`(app)/parametres/profil/_actions.ts`) — une seule ligne dans `users`, donc un
changement fait sur l'app est immédiatement visible sur le site et
réciproquement, sans mécanisme de synchronisation séparé. Seule la saisie
diffère : le formulaire du site demande le prénom et le nom dans deux champs
(`profileFormSchema`) et les réunit en un seul `name` ; l'API reçoit `name`
directement (`profileSchema`). `avatarUrl` reste hors périmètre : le
formulaire web ne le modifie pas non plus. `404 USER_NOT_FOUND` dans le cas
limite où le compte a été supprimé entre l'authentification et l'écriture
(même limite pour `POST /me/password` et `POST /me/email`).

`POST /me/password` et `POST /me/email` ont leur équivalent sur le site :
l'onglet « Sécurité » (`(app)/parametres/securite/`) propose les deux mêmes
changements par ses propres Server Actions (`changePasswordAction`,
`changeEmailAction`). Les deux côtés reposent sur les mêmes primitives
(`src/lib/auth/password.ts`, scrypt) et les mêmes fonctions de
`src/lib/data/users.ts` (`verifyUserPasswordById`, `updateUserPassword`,
`updateUserEmail`). Les deux routes exigent `currentPassword` : un jeton de
session seul ne suffit pas à prouver que c'est bien l'utilisateur qui tape, pas
un appareil qui aurait volé le jeton. `POST /me/password` révoque en plus
**toutes les autres** sessions mobiles de l'utilisateur (celle qui fait la
requête reste active) — un appareil qui n'avait que l'ancien mot de passe, ou
un jeton volé, cesse de fonctionner. Un changement de mot de passe fait depuis
le site révoque, lui, **toutes** les sessions mobiles du compte. Dans les deux
cas, les sessions du site ouvertes dans d'autres navigateurs prennent fin
aussi. `POST
/me/email` refuse `409 EMAIL_TAKEN` si l'adresse appartient déjà à un autre
compte (même vérification, en deux temps comme à l'inscription, qu'à `POST
/auth/register`).

`GET /me/summary` alimente l'écran d'accueil de l'app : `upcoming.count`
(même définition que `scope=upcoming`), `recent` (`reservations`, `hours`,
`creditsSpent` sur les `windowDays` = 30 derniers jours, réservations annulées
exclues), `attendance` (`past` réservations terminées, dont `attended` avec une
arrivée validée — l'app en tire un pourcentage, `past` peut valoir 0) et
`favoriteLocation` (`{ id, name, city, visits }` ou `null`). Ces chiffres sont
calculés par le serveur parce que l'app ne charge ses listes que page par page :
compter ce qu'elle a en mémoire serait faux dès la deuxième page. Fenêtre
glissante plutôt que mois civil : le serveur est en UTC, le téléphone dans le
fuseau de son propriétaire. Présence et lieu favori portent sur les 200
dernières réservations terminées.

**Check-in par QR.** `Space` n'a pas de coordonnées propres — seule sa
`Location` en a (`prisma/schema.prisma`) — donc le rayon de 150 m ne peut
jamais distinguer deux espaces qui partagent un même lieu. Scanner le QR
collé sur un espace (payload `repere:space:{id}`) et envoyer son id dans
`scannedSpaceId` ajoute cette précision, **en plus** de la position, pas à
sa place : si `scannedSpaceId` ne correspond pas à l'espace réservé, refus
immédiat (`WRONG_SPACE`), avant même de regarder l'heure ou la distance. Le
champ reste optionnel : un check-in sans scan continue de fonctionner
exactement comme avant. `scannedSpaceId` est aussi stocké sur la ligne
`check_ins`, qu'il corresponde ou non, pour que la trace montre si une
tentative a été corroborée par un scan.

**QR codes de test.** La page `/qrcode` du site (réservée aux administrateurs)
affiche un QR code par espace, avec son identifiant. C'est elle qui sert à
tester le scan : afficher le code à l'écran ou l'imprimer, puis le scanner
depuis l'application. Scanner le code d'un autre espace que celui réservé doit
donner `WRONG_SPACE`.

## Ce que le site partage avec l'API

L'espace membre du site appelle directement, sans passer par HTTP, les mêmes
fonctions de `src/lib/mobile/` que les routes ci-dessus :

| Fonction            | Route de l'API                     | Page ou action du site                                |
| ------------------- | ---------------------------------- | ----------------------------------------------------- |
| `listReservations`  | `GET /reservations`                | `/reservations`, `/tableau-de-bord`                   |
| `getReservation`    | `GET /reservations/{id}`           | `/reservations/[id]`                                  |
| `getMemberSummary`  | `GET /me/summary`                  | `/tableau-de-bord`                                    |
| `listNearbySpaces`  | `GET /spaces/nearby`               | `/reserver`, « Réserver près de moi »                 |
| `listCheckIns`      | `GET /check-ins`                   | `/arrivees`                                           |
| `createReservation` | `POST /reservations`               | `createReservationAction` (confirmer une réservation) |
| `cancelReservation` | `POST /reservations/{id}/cancel`   | `cancelReservationAction` (annuler)                   |
| `performCheckIn`    | `POST /reservations/{id}/check-in` | `checkInAction` (valider l'arrivée)                   |

Le site et l'application affichent donc les mêmes chiffres et appliquent les
mêmes règles. Les trois écritures sont des transactions, que la demande vienne
du site ou du téléphone.

Le site ajoute une règle que l'API n'a pas : sa Server Action refuse un
créneau hors des heures d'ouverture (9 h – 18 h, heure de Paris). L'API
s'en tient aux règles de durée et de date ci-dessous ; c'est le calendrier de
l'application qui ne propose que ces heures.

Le frein de connexion (`src/lib/mobile/rate-limit.ts`) est lui aussi commun :
les échecs sur le site et sur l'application comptent ensemble pour une même
adresse.

## Format d'erreur

```json
{
  "error": {
    "code": "SLOT_TAKEN",
    "message": "Ce créneau vient d'être réservé. Choisissez-en un autre."
  }
}
```

| Statut | Codes                                                                                                                    |
| ------ | ------------------------------------------------------------------------------------------------------------------------ |
| 400    | `INVALID_JSON`                                                                                                           |
| 401    | `UNAUTHENTICATED`, `INVALID_TOKEN`, `SESSION_REVOKED`, `SESSION_EXPIRED`, `INVALID_CREDENTIALS`                          |
| 402    | `INSUFFICIENT_CREDITS`                                                                                                   |
| 404    | `RESERVATION_NOT_FOUND`, `SPACE_NOT_FOUND`, `USER_NOT_FOUND`                                                             |
| 409    | `EMAIL_TAKEN`, `SLOT_TAKEN`, `SPACE_UNAVAILABLE`, `NOT_CANCELLABLE`, `ALREADY_STARTED`, `ALREADY_CHECKED_IN`, `CONFLICT` |
| 422    | `VALIDATION_ERROR`, `SLOT_IN_PAST`, `SLOT_TOO_FAR`, `SLOT_TOO_SHORT`, `SLOT_TOO_LONG`                                    |
| 429    | `TOO_MANY_ATTEMPTS`                                                                                                      |
| 500    | `INTERNAL_ERROR` (le détail reste dans le journal du serveur)                                                            |

## Règles métier (côté serveur, `src/lib/mobile/`)

- **Réservation.** Coût = `round(prix/h × heures)`, comme sur le site. Durée de 30
  minutes à 12 heures, début « maintenant » (5 minutes de tolérance) ou plus tard,
  au plus tard un mois à l'avance (`SLOT_TOO_FAR` au-delà de 32 jours : le
  calendrier de l'app s'arrête au même jour du mois suivant, le serveur garde un
  jour de marge pour les fuseaux horaires).
  Refus si l'espace est inactif ou si le créneau chevauche une réservation
  `confirmed`. Le débit est un `UPDATE … WHERE credits >= coût` : le solde ne peut
  pas devenir négatif.
- **Annulation.** Réservation à soi, `confirmed`, pas encore commencée, sans arrivée
  validée. Le statut passe à `cancelled` par un `UPDATE … WHERE status = 'confirmed'` :
  de deux annulations simultanées, une seule matche, donc le remboursement n'est
  versé qu'une fois.
- **Check-in.** Fenêtre : de 15 minutes avant le début jusqu'à la fin. Position
  précise à 100 m ou mieux, prise il y a moins de 60 s, à **150 m ou moins** du lieu.
  `scannedSpaceId` optionnel (voir « Check-in par QR » plus haut) : s'il est
  fourni et ne correspond pas à l'espace réservé, c'est la toute première règle
  vérifiée. La première règle qui échoue donne le motif (`NOT_CONFIRMED`,
  `WRONG_SPACE`, `TOO_EARLY`, `TOO_LATE`, `LOW_ACCURACY`, `STALE_POSITION`,
  `TOO_FAR`). **Chaque tentative**, acceptée ou refusée, est enregistrée dans
  `check_ins` : c'est la trace. La réponse est `201` dans les deux cas : l'app
  lit `checkIn.accepted` et `checkIn.reason`. Une arrivée déjà validée renvoie
  `409 ALREADY_CHECKED_IN`.
- **Transactions.** Réservation et check-in tournent en isolation `SERIALIZABLE` :
  si deux requêtes conflictuelles arrivent en même temps, PostgreSQL en annule une
  (`40001`) et le code la rejoue (3 essais). Avec l'adaptateur `pg` de Prisma 7,
  cette erreur arrive sous forme de `DriverAdapterError`, pas de `P2034` : c'est
  géré dans `src/lib/mobile/transaction.ts`.

## Limites connues

- **La position envoyée par le téléphone est falsifiable** (téléphone rooté, app
  modifiée). Le serveur décide, mais ne peut prouver la présence que dans la
  mesure où le téléphone dit vrai.
- Le frein de connexion vit en mémoire : il se réinitialise au redémarrage et ne
  serait pas partagé entre plusieurs instances.
- L'API ne revérifie pas les heures d'ouverture d'un créneau : cette règle est
  appliquée par le calendrier de l'application, et par la Server Action du
  site.
- Un client Prisma déjà chargé par `next dev` ne connaît pas les modèles ajoutés
  après coup : redémarrer le serveur de dev après une migration.

## Tester à la main

Avec l'application lancée (par `docker compose up --build`, ou par
`npm run dev`) :

```bash
BASE=http://localhost:3000/api/mobile/v1
curl -s $BASE/health

TOKEN=$(curl -s -X POST $BASE/auth/login -H "Content-Type: application/json" \
  -d '{"email":"camille@example.com","password":"demo1234"}' \
  | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).token")

curl -s $BASE/me -H "Authorization: Bearer $TOKEN"
curl -s "$BASE/spaces/nearby?lat=45.7605&lng=4.8607" -H "Authorization: Bearer $TOKEN"
curl -s $BASE/reservations -H "Authorization: Bearer $TOKEN"
curl -s -X POST $BASE/auth/logout -H "Authorization: Bearer $TOKEN" -o /dev/null -w "%{http_code}\n"
```
