# Base de données — PostgreSQL + Prisma

Ce document vit dans `docs/` (suivi par git), comme `choix-de-rendu.md` et pour
la même raison : `CLAUDE.md` est exclu du dépôt, donc invisible en soutenance.

## Ce qui a changé

Jusqu'ici, les données vivaient dans des fichiers JSON sur disque
(`.data/*.json`, gitignored), derrière une interface repository
(`createCollection<T>()` dans `src/lib/data/store.ts`). Ça persistait
vraiment, mais ce n'était pas une vraie base : pas de transactions, pas
d'accès concurrent géré, pas de vraies relations.

C'est maintenant une vraie base **PostgreSQL**, via **Prisma** comme ORM.
`store.ts` et le seed mock ont été supprimés — plus aucune donnée n'est
mockée.

## Lancer la base en local

PostgreSQL tourne dans **Docker** (`docker-compose.yml`, port hôte `5433`
pour ne pas entrer en conflit avec un Postgres déjà installé) — pas besoin
d'installer Postgres ni d'être administrateur de la machine.

```bash
npm run db:up       # démarre le conteneur Postgres (docker compose)
npm run db:migrate  # applique les migrations Prisma (prisma migrate dev)
npm run db:seed      # peuple la base avec les données de démo
npm run dev
```

`npm install` régénère automatiquement le client Prisma (`postinstall` →
`prisma generate`). `.env` (gitignored) contient `DATABASE_URL` ; voir
`.env.example` pour la valeur par défaut, qui correspond directement à
`docker-compose.yml`.

Comptes de démo après seed (mot de passe `demo1234` pour les deux) :

- `admin@example.com` — rôle administrateur
- `camille@example.com` — rôle membre

## Choix techniques

**Prisma 7 avec adaptateur `pg` (driver adapters)**, pas le moteur Rust
historique de Prisma — c'est l'architecture par défaut depuis Prisma 7
(`prisma.config.ts` porte l'URL de connexion pour la CLI ; `src/lib/db/prisma.ts`
instancie `PrismaClient` avec `PrismaPg` côté runtime). Plus léger, sans
binaire natif séparé à télécharger.

**Mots de passe réels** : l'ancienne authentification mock acceptait
n'importe quel mot de passe pour un e-mail connu. `src/lib/auth/password.ts`
hache maintenant les mots de passe avec `scrypt` (natif à Node, pas de
dépendance ajoutée) et `verifyUserCredentials()` (`src/lib/data/users.ts`)
vérifie le hash au login. Le hash n'est jamais renvoyé au reste de l'app —
le type `User` partagé (`src/types/domain.ts`) n'a pas de champ mot de
passe ; seule la requête Prisma interne à `users.ts` touche `passwordHash`.

**Interface repository inchangée** : `src/lib/data/*.ts` (users, locations,
spaces, reservations, preferences) gardent exactement les mêmes fonctions
exportées qu'avant (`listX`, `getXById`, `createX`, `updateX`, ...) — seule
l'implémentation interne passe de `createCollection()` à des appels Prisma.
Aucune page ni Server Action n'a eu besoin de changer sa façon d'appeler la
couche données, seulement `connexion/_actions.ts` et `inscription/_actions.ts`
(mot de passe réel) et l'ajout de `docker-compose.yml`/`prisma/`.

**Enums Prisma vs `String`** : `UserRole`, `MemberType`, `SpaceStatus`,
`Theme` et `ReservationStatus` sont de vrais enums PostgreSQL (leurs valeurs
sont déjà des identifiants valides). `Space.type` reste une simple colonne
`String` : ses valeurs (`"poste-flex"`, ...) contiennent des tirets, invalides
comme identifiants d'enum Prisma — le jeu de valeurs fini est déjà validé par
zod à la frontière des formulaires (`src/lib/validation/space.ts`).

**Relations réelles** : `Space.locationId` et `Reservation.userId` /
`Reservation.spaceId` sont de vraies clés étrangères (`onDelete: Cascade`) —
supprimer un lieu supprime ses espaces, supprimer un utilisateur supprime ses
réservations.

## Vérifié

Build de production (`next build`) testé avec la base réelle (y compris la
génération statique de `/sitemap.xml`, qui lit les lieux au build). Parcours
testés en direct dans le navigateur : inscription → connexion (bon mot de
passe / mauvais mot de passe rejeté) → réservation → annulation (crédits
recrédités) ; côté admin : création/édition/suppression de lieu, d'espace et
d'utilisateur.
