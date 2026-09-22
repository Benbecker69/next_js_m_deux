# API mobile — `/api/mobile/v1`

Ce document vit dans `docs/` (suivi par git), comme `choix-de-rendu.md` et
`base-de-donnees.md`. Il décrit l'API HTTP que l'application mobile Expo
(dépôt séparé) utilise pour réutiliser le backend du site.

## Pourquoi des Route Handlers (et pas des Server Actions)

Le cahier des charges demande de justifier chaque Route Handler.

- **Le client n'est pas un navigateur.** Une app native n'a ni cookies Next, ni
  formulaires, ni rendu React : elle parle HTTP/JSON avec un jeton dans l'en-tête
  `Authorization`.
- **Un Route Handler est un contrat HTTP explicite** (méthode, URL, statuts, JSON).
  Une Server Action est un point d'entrée interne à Next.js, lié au rendu et à des
  identifiants générés : ce n'est pas une API qu'un client tiers peut appeler
  de façon stable.
- **Le cookie du site ne peut pas servir de jeton.** `repere_session` contient
  l'identifiant utilisateur brut, non signé : le distribuer à un téléphone
  reviendrait à donner une clé que quiconque connaît un identifiant peut forger.
  L'API mobile a donc son propre jeton (voir plus bas), sans toucher à la session du
  site (`src/lib/auth/session.ts` n'est pas modifié).

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

| Route                              | Auth | Entrée                                     | Réponse                          |
| ---------------------------------- | ---- | ------------------------------------------ | -------------------------------- |
| `GET /health`                      | non  | —                                          | `{ status, api, version, time }` |
| `POST /auth/register`              | non  | `{ name, email, password, deviceName? }`   | `201 { token, expiresAt, user }` |
| `POST /auth/login`                 | non  | `{ email, password, deviceName? }`         | `{ token, expiresAt, user }`     |
| `POST /auth/logout`                | oui  | —                                          | `204`                            |
| `GET /me`                          | oui  | —                                          | `{ user }`                       |
| `GET /spaces/nearby`               | oui  | `lat, lng, startAt?, endAt?, limit?`       | `{ slot, hasPosition, items[] }` |
| `GET /reservations`                | oui  | `scope=upcoming\|past\|all, limit, cursor` | `{ items[], nextCursor }`        |
| `POST /reservations`               | oui  | `{ spaceId, startAt, endAt }`              | `201 { reservation, credits }`   |
| `GET /reservations/{id}`           | oui  | —                                          | `{ reservation }`                |
| `POST /reservations/{id}/cancel`   | oui  | —                                          | `{ reservation, credits }`       |
| `POST /reservations/{id}/check-in` | oui  | `{ lat, lng, accuracyM, capturedAt }`      | `201 { checkIn, radiusM }`       |
| `GET /check-ins`                   | oui  | `limit, cursor`                            | `{ items[], nextCursor }`        |

Conventions : dates en ISO 8601 UTC (`2026-09-21T10:00:00.000Z`) ; pagination par
curseur (`nextCursor` est `null` en fin de liste) ; réponses jamais mises en cache
(`Cache-Control: no-store`) ; aucune ligne de base de données n'est renvoyée
telle quelle, seulement les formes de `src/lib/mobile/dto.ts`.

`GET /spaces/nearby` sans `lat`/`lng` reste utile : la liste est triée par ordre
alphabétique (`hasPosition: false`, `distanceM: null`), ce qui permet à l'app de
fonctionner quand l'utilisateur refuse la permission de position.

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
| 404    | `RESERVATION_NOT_FOUND`, `SPACE_NOT_FOUND`                                                                               |
| 409    | `EMAIL_TAKEN`, `SLOT_TAKEN`, `SPACE_UNAVAILABLE`, `NOT_CANCELLABLE`, `ALREADY_STARTED`, `ALREADY_CHECKED_IN`, `CONFLICT` |
| 422    | `VALIDATION_ERROR`, `SLOT_IN_PAST`, `SLOT_TOO_SHORT`, `SLOT_TOO_LONG`                                                    |
| 429    | `TOO_MANY_ATTEMPTS`                                                                                                      |
| 500    | `INTERNAL_ERROR` (le détail reste dans le journal du serveur)                                                            |

## Règles métier (côté serveur, `src/lib/mobile/`)

- **Réservation.** Coût = `round(prix/h × heures)`, comme sur le site. Durée de 30
  minutes à 12 heures, début « maintenant » (5 minutes de tolérance) ou plus tard.
  Refus si l'espace est inactif ou si le créneau chevauche une réservation
  `confirmed`. Le débit est un `UPDATE … WHERE credits >= coût` : le solde ne peut
  pas devenir négatif.
- **Annulation.** Réservation à soi, `confirmed`, pas encore commencée, sans arrivée
  validée. Le statut passe à `cancelled` par un `UPDATE … WHERE status = 'confirmed'` :
  de deux annulations simultanées, une seule matche, donc le remboursement n'est
  versé qu'une fois.
- **Check-in.** Fenêtre : de 15 minutes avant le début jusqu'à la fin. Position
  précise à 100 m ou mieux, prise il y a moins de 60 s, à **150 m ou moins** du lieu.
  La première règle qui échoue donne le motif (`NOT_CONFIRMED`, `TOO_EARLY`,
  `TOO_LATE`, `LOW_ACCURACY`, `STALE_POSITION`, `TOO_FAR`). **Chaque tentative**,
  acceptée ou refusée, est enregistrée dans `check_ins` : c'est la trace. La
  réponse est `201` dans les deux cas : l'app lit `checkIn.accepted` et
  `checkIn.reason`. Une arrivée déjà validée renvoie `409 ALREADY_CHECKED_IN`.
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
- Les Server Actions du site lisent puis réécrivent le solde de crédits sans
  transaction ; l'API mobile, elle, est atomique. Le site n'a pas été modifié.
- Un client Prisma déjà chargé par `next dev` ne connaît pas les modèles ajoutés
  après coup : redémarrer le serveur de dev après une migration.

## Tester à la main

```bash
BASE=http://127.0.0.1:3100/api/mobile/v1   # `npm run build && npm run start -- -p 3100`
curl -s $BASE/health

TOKEN=$(curl -s -X POST $BASE/auth/login -H "Content-Type: application/json" \
  -d '{"email":"camille@example.com","password":"demo1234"}' \
  | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).token")

curl -s $BASE/me -H "Authorization: Bearer $TOKEN"
curl -s "$BASE/spaces/nearby?lat=45.7605&lng=4.8607" -H "Authorization: Bearer $TOKEN"
curl -s $BASE/reservations -H "Authorization: Bearer $TOKEN"
curl -s -X POST $BASE/auth/logout -H "Authorization: Bearer $TOKEN" -o /dev/null -w "%{http_code}\n"
```
