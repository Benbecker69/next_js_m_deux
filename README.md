# Repère

Plateforme de réservation d'espaces de coworking : un site public pour découvrir
les lieux, un espace membre pour réserver à l'heure et payer en crédits, un
back-office pour gérer les lieux et les utilisateurs, et une API pour
l'application mobile.

Next.js 16.3 (App Router) · React 19 · TypeScript · Tailwind CSS 4 ·
PostgreSQL 16 · Prisma 7 · Docker.

Projet fil rouge individuel — Ilias Benharrat, M2 EEMI, 2026.
Application mobile associée (dépôt séparé) :
<https://github.com/Benbecker69/react_native_eemi>.

## Sommaire

- [Guide de correction](#guide-de-correction)
- [Le produit](#le-produit)
- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Installation et lancement](#installation-et-lancement)
- [Comptes de démonstration](#comptes-de-démonstration)
- [Tester en cinq minutes](#tester-en-cinq-minutes)
- [Schéma de données](#schéma-de-données)
- [Application mobile, QR code et géolocalisation](#application-mobile-qr-code-et-géolocalisation)
- [Docker](#docker)
- [Docker — sécurité & IA](#docker--sécurité--ia)
- [Usage de l'IA](#usage-de-lia)
- [Limites connues](#limites-connues)
- [Documentation](#documentation)

## Guide de correction

Pour chaque ligne du barème : où lire, quels fichiers ouvrir, et comment le
constater dans l'application.

### Note Next.js

| Critère du barème                                        | Document                                                                     | Fichiers à ouvrir                                                                                   | À constater dans l'application                                                                                            |
| -------------------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Architecture App Router & organisation                   | [docs/architecture.md](docs/architecture.md)                                 | `src/app/(marketing)`, `(auth)`, `(onboarding)`, `(app)`, `(app)/admin/layout.tsx`                  | Quatre groupes de routes, trois niveaux de layouts imbriqués                                                              |
| Fonctionnalités & parcours métier                        | [docs/fonctionnalites.md](docs/fonctionnalites.md)                           | `src/app/(app)/reserver/[spaceId]/_actions.ts`                                                      | Réserver, voir le solde baisser, annuler, voir le solde remonter                                                          |
| Data, Server Components, Server Actions & Route Handlers | [docs/choix-de-rendu.md](docs/choix-de-rendu.md)                             | `src/lib/data/`, les fichiers `_actions.ts`, `src/app/(auth)/deconnexion/route.ts`, `src/app/api/`  | 20 Server Actions, 40 composants client justifiés, 2 familles de Route Handlers                                           |
| Authentification, autorisation & sécurité                | [docs/authentification-et-securite.md](docs/authentification-et-securite.md) | `src/lib/auth/session.ts`, `src/lib/data/sessions.ts`, `src/lib/auth/password.ts`                   | `/admin` avec le compte membre → « accès refusé » ; un identifiant d'utilisateur mis à la place du cookie ne connecte pas |
| UX/UI, responsive & états d'interface                    | [docs/interface-et-etats.md](docs/interface-et-etats.md)                     | `src/components/skeletons.tsx`, `src/components/error-screen.tsx`, les `loading.tsx` et `error.tsx` | Soumettre un formulaire vide ; ouvrir `/lieux/inconnu` ; réduire la fenêtre                                               |
| Performance, cache, SEO & optimisation                   | [docs/performance-cache-seo.md](docs/performance-cache-seo.md)               | `src/lib/data/locations.ts`, `src/app/sitemap.ts`, `src/app/robots.ts`, `next.config.ts`            | `/sitemap.xml`, `/robots.txt` ; Lighthouse : performance 97 à 100, accessibilité, bonnes pratiques et SEO à 100           |
| Qualité du code, tests, README & déploiement             | [docs/git-et-github.md](docs/git-et-github.md)                               | `tsconfig.json`, `eslint.config.mjs`, les fichiers `*.test.ts`, `git log --oneline --graph`         | `npm run lint`, `npm run typecheck`, `npm run test` (80 tests) et `npm run build` passent                                 |

Ce qui manque, dit clairement : l'application **n'est pas déployée en ligne**.
Elle se lance en local, en développement ou par l'image Docker de production.
Les tests sont des tests unitaires des règles métier ; il n'y a pas de tests de
bout en bout. Voir [Limites connues](#limites-connues).

### Ce que le sujet demande de retrouver dans le dépôt

| Exigence                           | Où                                                                                                                                                             |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| App Router, route groups           | `src/app/(marketing)`, `(auth)`, `(onboarding)`, `(app)`                                                                                                       |
| Layouts imbriqués                  | `src/app/layout.tsx` → `(app)/layout.tsx` → `(app)/admin/layout.tsx` et `(app)/parametres/layout.tsx`                                                          |
| Server Components                  | Toutes les pages et tous les layouts                                                                                                                           |
| Client Components limités          | 40 fichiers `"use client"`, classés par raison dans [docs/choix-de-rendu.md](docs/choix-de-rendu.md)                                                           |
| Route dynamique                    | `/lieux/[slug]`, `/reserver/[spaceId]`, `/reservations/[id]`, `/arrivees/[id]`, `/admin/*/[id]`                                                                |
| Server Action                      | 20 actions dans 13 fichiers `_actions.ts`, par exemple `src/app/(app)/reserver/[spaceId]/_actions.ts`                                                          |
| Route Handler avec justification   | `src/app/(auth)/deconnexion/route.ts` et `src/app/api/mobile/v1/` — justifiés dans [docs/choix-de-rendu.md](docs/choix-de-rendu.md#route-handlers-et-pourquoi) |
| `loading.tsx`                      | 24 fichiers, un par page                                                                                                                                       |
| `error.tsx`                        | `src/app/error.tsx`, `global-error.tsx`, `(app)/error.tsx`, `(app)/tableau-de-bord/error.tsx`, `(marketing)/error.tsx`                                         |
| `notFound()`                       | Les sept pages à paramètre dynamique ; `not-found.tsx` à la racine, dans `(marketing)` et dans `(app)`                                                         |
| Metadata API                       | `generateMetadata` ou `metadata` sur les pages ; modèle de titre dans `src/app/layout.tsx`                                                                     |
| `next/image`                       | `src/components/location-photo.tsx`, `src/components/space-photo.tsx`, pages d'accueil, tarifs, fonctionnalités                                                |
| Authentification serveur           | `src/lib/auth/session.ts` : `getSession`, `requireUser`, `requireOnboarded`, `requireAdmin`                                                                    |
| Stratégie de cache et invalidation | `unstable_cache` + `revalidateTag` : `src/lib/data/locations.ts`, `src/lib/data/spaces.ts`, `src/app/(app)/admin/lieux/`                                       |
| Trois choix de rendu justifiés     | Six sont détaillés dans [docs/choix-de-rendu.md](docs/choix-de-rendu.md#choix-de-rendu-justifiés)                                                              |
| Sitemap et robots                  | `src/app/sitemap.ts`, `src/app/robots.ts`                                                                                                                      |
| Lighthouse interprété              | [docs/performance-cache-seo.md](docs/performance-cache-seo.md#audit-lighthouse)                                                                                |
| `proxy.ts` (« si utile »)          | Non utilisé : les gardes sont dans les layouts, les pages et les actions                                                                                       |

### Note Docker

| Critère du barème                                     | Où                                                                                               |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Dockerfile Next.js fonctionnel et adapté production   | `Dockerfile` ; expliqué ligne par ligne dans [docs/docker.md](docs/docker.md)                    |
| `.dockerignore`, contexte de build, cache des couches | `.dockerignore` ; [docs/docker.md](docs/docker.md#dockerignore-et-contexte-de-build)             |
| Lancement documenté                                   | [Docker](#docker) ci-dessous : `docker compose up --build` ou `docker run`                       |
| Variables d'environnement et secrets                  | `.env.example` ; [Variables](#variables)                                                         |
| Image lançable et testable localement                 | [Vérifier](#vérifier)                                                                            |
| Docker Scout et lecture du résultat                   | [Docker — sécurité & IA](#docker--sécurité--ia)                                                  |
| Usage de l'IA documenté                               | [Recommandations de l'assistant IA et décisions](#recommandations-de-lassistant-ia-et-décisions) |

## Le produit

**Le besoin.** Trouver un endroit pour travailler quelques heures, savoir avant
de se déplacer qu'il sera libre, et ne payer que le temps utilisé.

**La réponse.** Repère référence des lieux de coworking et leurs espaces : poste
flex, cabine téléphonique, bureau privé, salle de réunion. Un membre réserve un
espace à l'heure. Chaque heure coûte des **crédits**, selon le type d'espace ;
ils sont débités à la réservation et rendus en entier si la réservation est
annulée avant son début.

**Trois publics.**

| Public         | Ce qu'il fait                                                                               |
| -------------- | ------------------------------------------------------------------------------------------- |
| Visiteur       | Découvre les lieux, les types d'espace et les tarifs, puis crée un compte                   |
| Membre         | Réserve, consulte et annule ses réservations, valide son arrivée sur place, gère son compte |
| Administrateur | Gère les lieux, les espaces, les utilisateurs et les réservations                           |

**La suite mobile.** L'application mobile sert au moment d'arriver : réserver
l'espace libre le plus proche (géolocalisation) et valider sa présence (position
et QR code de l'espace). Elle utilise le même compte, les mêmes crédits et la
même base que le site, par l'API `/api/mobile/v1`. Le sujet initial prévoyait le
NFC ; le sujet de soutenance retient le scan de QR code et la géolocalisation, le
NFC devenant facultatif. Il n'est pas implémenté.

Les lieux présentés sont fictifs : Repère est un projet de démonstration.

## Fonctionnalités

Liste détaillée, règles métier et scénario de démonstration :
[docs/fonctionnalites.md](docs/fonctionnalites.md).

| Expérience       | Ce qui existe                                                                                                                                |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Marketing        | Accueil avec recherche, lieux filtrables, page d'un lieu, tarifs lus en base, fonctionnalités, FAQ, français / anglais, thème clair / sombre |
| Authentification | Inscription, connexion, déconnexion, session lue sur le serveur, mots de passe hachés                                                        |
| Onboarding       | Profil obligatoire après l'inscription : situation et lieu habituel                                                                          |
| Espace membre    | Accueil avec prochaine réservation et activité, liste des réservations, historique des arrivées                                              |
| Module métier    | Recherche d'espace, tri par distance, carte, calendrier mensuel, réservation avec débit de crédits, annulation, validation de l'arrivée      |
| Paramètres       | Profil, e-mail et mot de passe, préférences                                                                                                  |
| Back-office      | Statistiques, lieux et espaces, utilisateurs (rôle, crédits, suppression), réservations filtrables et annulables                             |
| API mobile       | 17 points d'entrée JSON : [docs/api-mobile.md](docs/api-mobile.md)                                                                           |

## Architecture

Explication complète : [docs/architecture.md](docs/architecture.md).

Une seule application Next.js. Les pages lisent la base sur le serveur, les
écritures passent par des Server Actions, l'application mobile passe par des
Route Handlers. Il n'y a pas de serveur backend séparé.

```
src/
  app/
    (marketing)/     site public : /, /lieux, /lieux/[slug], /tarifs, /faq…
    (auth)/          /connexion, /inscription, /deconnexion
    (onboarding)/    /bienvenue, /profil
    (app)/           espace membre : /tableau-de-bord, /reserver, /reservations,
                     /arrivees, /parametres — et le back-office /admin
    api/mobile/v1/   API JSON de l'application mobile
    qrcode/          QR codes de test (administrateurs)
  components/        composants partagés
  lib/
    auth/            session et gardes serveur
    data/            accès à la base, un fichier par entité
    validation/      schémas zod
    feedback/        résultats d'actions, toasts
    i18n/            dictionnaires français et anglais
    mobile/          règles de l'API mobile
prisma/              schéma, migrations, données de démonstration
docs/                documentation
```

| Technologie            | Rôle                                                       |
| ---------------------- | ---------------------------------------------------------- |
| Next.js 16.3, React 19 | Application, rendu serveur, Server Actions, Route Handlers |
| TypeScript (strict)    | Typage                                                     |
| Tailwind CSS 4         | Styles, à partir de variables CSS                          |
| PostgreSQL 16          | Base de données                                            |
| Prisma 7               | Schéma, migrations, requêtes                               |
| zod                    | Validation des entrées                                     |
| Leaflet                | Carte des lieux                                            |
| Docker                 | PostgreSQL local, image de production                      |

## Installation et lancement

Deux façons de lancer le projet. La plus courte ne demande que Docker.

### Le plus rapide : tout dans Docker

Pré-requis : Docker Desktop, ou Docker Engine avec le plugin Compose.

```bash
git clone https://github.com/Benbecker69/next_js_m_deux.git
cd next_js_m_deux
docker compose up --build
```

Ouvrir <http://localhost:3000>. La commande démarre PostgreSQL, applique les
migrations, charge les données de démonstration et lance l'application en mode
production. Détail dans la section [Docker](#docker).

### En développement

Pré-requis : Node.js 24 et Docker (pour PostgreSQL).

```bash
git clone https://github.com/Benbecker69/next_js_m_deux.git
cd next_js_m_deux
cp .env.example .env   # DATABASE_URL du PostgreSQL local
npm install            # installe et génère le client Prisma (postinstall)
npm run db:up          # démarre PostgreSQL dans Docker (port hôte 5433)
npm run db:migrate     # applique les migrations
npm run db:seed        # charge les données de démonstration
npm run dev            # http://localhost:3000
```

### Variables d'environnement

Une seule variable, décrite dans `.env.example`.

| Variable       | Rôle                          | Valeur en développement                                          |
| -------------- | ----------------------------- | ---------------------------------------------------------------- |
| `DATABASE_URL` | Adresse de la base PostgreSQL | `postgresql://repere:repere@localhost:5433/repere?schema=public` |

Elle est lue sur le serveur uniquement et n'est jamais envoyée au navigateur. Le
projet n'a aucune variable `NEXT_PUBLIC_`. Les identifiants `repere` / `repere`
sont ceux du PostgreSQL local de démonstration.

### Commandes

| Commande               | Effet                                                      |
| ---------------------- | ---------------------------------------------------------- |
| `npm run dev`          | Serveur de développement                                   |
| `npm run build`        | Build de production                                        |
| `npm run start`        | Serveur de production (après `build`)                      |
| `npm run lint`         | ESLint                                                     |
| `npm run typecheck`    | Vérification TypeScript                                    |
| `npm run test`         | Tests unitaires (Vitest)                                   |
| `npm run format`       | Met en forme avec Prettier                                 |
| `npm run format:check` | Vérifie la mise en forme                                   |
| `npm run db:up`        | Démarre PostgreSQL (Docker)                                |
| `npm run db:down`      | Arrête les conteneurs ; les données restent dans le volume |
| `npm run db:migrate`   | Applique les migrations (`prisma migrate dev`)             |
| `npm run db:seed`      | Charge les données de démonstration                        |
| `npm run db:studio`    | Ouvre Prisma Studio pour consulter la base                 |

Base de données en détail : [docs/base-de-donnees.md](docs/base-de-donnees.md).

### Contexte de développement

Je développe sur un **ordinateur de mon entreprise** : un serveur Windows
Server 2022 auquel j'accède en **bureau à distance (RDS)**, **sans droits
d'administrateur**. Ce poste est dans le domaine de l'entreprise, qui gère son
pare-feu, et il héberge d'autres projets. Plusieurs choix du projet viennent de
là :

| Contrainte                                      | Ce que j'ai fait                                                                                              |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Pas de droits d'administrateur                  | PostgreSQL tourne dans un conteneur Docker : aucune installation sur le poste                                 |
| Poste partagé, ports déjà utilisés              | PostgreSQL est publié sur le port `5433` ; le port du site se change avec `WEB_PORT` (voir [Docker](#docker)) |
| Ports du poste injoignables depuis un téléphone | L'application mobile atteint l'API par un tunnel et une passerelle qui ne transmet que `/api/mobile/v1/*`     |
| Je ne peux pas ouvrir de port dans le pare-feu  | Tout passe par des connexions sortantes : rien n'est modifié sur le poste                                     |

Le détail des problèmes de ports et de réseau rencontrés avec le téléphone, et
leur solution, est dans le dépôt de l'application mobile :
[docs/environnement-et-reseau.md](https://github.com/Benbecker69/react_native_eemi/blob/main/docs/environnement-et-reseau.md).

## Comptes de démonstration

Créés par le seed. Mot de passe `demo1234` pour les deux. La page `/connexion`
propose deux boutons qui remplissent le formulaire.

| Rôle           | E-mail                | Crédits au départ |
| -------------- | --------------------- | ----------------- |
| Membre         | `camille@example.com` | 250               |
| Administrateur | `admin@example.com`   | 500               |

Un compte créé par `/inscription` reçoit 20 crédits et passe par l'onboarding.

## Tester en cinq minutes

1. **Site public.** `/` → choisir une ville dans la recherche → ouvrir un lieu.
   Ouvrir `/lieux/inconnu` : page « introuvable ».
2. **Route protégée.** Ouvrir `/tableau-de-bord` sans être connecté : retour à
   `/connexion` avec le message « Connexion requise ».
3. **Parcours principal.** Se connecter avec `camille@example.com` → « Réserver
   un espace » → choisir un espace → un jour, une heure de début, une heure de
   fin → « Confirmer la réservation ». Le solde de crédits baisse.
4. **Historique et annulation.** « Mes réservations » → ouvrir la réservation →
   « Annuler la réservation ». Le solde remonte.
5. **Paramètres.** « Mon compte » → modifier le prénom → toast de succès. Vider
   le champ et enregistrer : l'erreur s'affiche sous le champ.
6. **Autorisation.** Toujours avec le compte membre, ouvrir `/admin` : page
   « accès refusé ».
7. **Back-office.** Se connecter avec `admin@example.com` → « Administration » →
   Lieux → ouvrir un lieu → passer un espace en maintenance : il disparaît de
   `/reserver`.
8. **Onboarding.** Créer un compte par `/inscription` : passage obligé par
   `/bienvenue` puis `/profil`.

## Schéma de données

Schéma complet, relations, migrations et seed :
[docs/base-de-donnees.md](docs/base-de-donnees.md). Source :
`prisma/schema.prisma`.

```mermaid
erDiagram
  users ||--o{ reservations : "réserve"
  users ||--o| preferences : "a"
  users ||--o{ sessions : "ouvre"
  users ||--o{ mobile_sessions : "ouvre"
  users ||--o{ check_ins : "tente"
  locations ||--o{ spaces : "contient"
  spaces ||--o{ reservations : "est réservé par"
  reservations ||--o{ check_ins : "reçoit"
```

| Table             | Contenu                                                     |
| ----------------- | ----------------------------------------------------------- |
| `users`           | Comptes, mot de passe haché, rôle, solde de crédits         |
| `locations`       | Lieux, avec coordonnées GPS                                 |
| `spaces`          | Espaces d'un lieu : type, capacité, prix par heure, statut  |
| `reservations`    | Réservation d'un espace par un membre sur un créneau        |
| `preferences`     | Préférences d'un membre                                     |
| `sessions`        | Sessions du site (empreinte du jeton du cookie, expiration) |
| `mobile_sessions` | Sessions de l'application mobile                            |
| `check_ins`       | Tentatives de validation d'arrivée, acceptées ou refusées   |

## Application mobile, QR code et géolocalisation

L'application mobile est dans un dépôt séparé :
<https://github.com/Benbecker69/react_native_eemi>. Son README explique comment
la lancer sur un téléphone et comment tester le scan et la géolocalisation côté
téléphone. Ce dépôt-ci fournit le backend qu'elle appelle.

| Ce que le site fournit    | Où                                                                    |
| ------------------------- | --------------------------------------------------------------------- |
| L'API                     | `/api/mobile/v1` — contrat : [docs/api-mobile.md](docs/api-mobile.md) |
| Vérifier que l'API répond | <http://localhost:3000/api/mobile/v1/health> → `{"status":"ok",…}`    |
| Les QR codes de test      | `/qrcode`, connecté en administrateur : un QR code par espace         |

### Tester le QR code

1. Se connecter en administrateur et ouvrir `/qrcode`.
2. Chaque espace a son QR code, qui encode `repere:space:<identifiant>`.
3. Depuis l'application mobile, sur une réservation, scanner le code de
   l'espace réservé. Scanner celui d'un autre espace doit être refusé (« mauvais
   espace »).

Le scan n'ouvre pas une adresse web : l'identifiant lu est envoyé au serveur avec
la position, et c'est le serveur qui valide ou refuse l'arrivée. Le site n'a pas
de scan (il demanderait la caméra).

### Tester la géolocalisation sur le site

| Fonction                | Où                                               | Comportement                                                                                              |
| ----------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| Tri par distance        | `/reserver`, « Trier par distance »              | Demande la position au navigateur et classe les espaces                                                   |
| Réserver près de moi    | `/reserver`, « Trouver l'espace le plus proche » | Ouvre l'espace libre le plus proche, première heure libre présélectionnée                                 |
| Carte des lieux         | `/reserver`                                      | Affichée si la localisation est autorisée ; sinon carte grisée avec un bouton « Activer la localisation » |
| Validation de l'arrivée | `/reservations/[id]`, « Valider mon arrivée »    | Envoie la position au serveur, qui accepte ou refuse en expliquant pourquoi                               |

Si la permission est refusée, chaque fonction affiche un message et le reste de
la page continue de fonctionner.

Une arrivée n'est acceptée qu'à moins de 150 m du lieu, entre 15 minutes avant le
début du créneau et sa fin, avec une position précise à 100 m ou mieux. Loin du
lieu, le refus est le résultat normal : il s'affiche avec la distance mesurée et
apparaît dans « Arrivées ». Pour obtenir une arrivée acceptée sans se déplacer, on
peut simuler une position dans les outils de développement du navigateur
(coordonnées du lieu, précision de 100 m au plus). Les coordonnées des lieux de
démonstration sont dans `prisma/seed.ts`.

## Docker

L'application est livrée en image de production : build multi-étapes, sortie
`standalone` de Next.js, utilisateur non-root, aucun secret dans l'image.

Explication du `Dockerfile` ligne par ligne, du `.dockerignore`, du cache des
couches et des questions de soutenance : [docs/docker.md](docs/docker.md).

| Fichier              | Rôle                                                              |
| -------------------- | ----------------------------------------------------------------- |
| `Dockerfile`         | image de l'application (`runner`) + image des migrations          |
| `.dockerignore`      | ce qui n'entre jamais dans le contexte de build                   |
| `docker-compose.yml` | PostgreSQL, migrations et application, ensemble                   |
| `.env.example`       | la seule variable, `DATABASE_URL`, et ses trois valeurs possibles |

### Pré-requis

Docker Desktop (ou Docker Engine avec le plugin Compose). Node.js n'est pas
nécessaire pour lancer l'application avec Compose.

### Avec Compose (le plus simple)

```bash
docker compose up --build
```

Puis ouvrir <http://localhost:3000> et se connecter avec un compte de
démonstration. Cette commande enchaîne trois services :

1. `postgres` — la base, avec un healthcheck ;
2. `migrate` — applique les migrations, charge les données de démonstration
   **si la base est vide**, puis s'arrête (`Exited (0)` est son état normal) ;
3. `web` — l'application, démarrée seulement quand `migrate` a réussi.

```bash
docker compose logs -f web    # journaux de l'application
docker compose ps             # état ; `web` doit être "healthy"
docker compose down           # arrête tout, les données restent dans le volume
```

Si le port 3000 est déjà pris (par `npm run dev`, par exemple) :

```bash
WEB_PORT=3100 docker compose up --build                 # bash
$env:WEB_PORT = 3100; docker compose up --build         # PowerShell
```

### Variables

Une seule variable, `DATABASE_URL`. Elle est lue **au démarrage du conteneur**,
jamais pendant le build : l'image se construit sans base et sans secret.

| Lancement                   | D'où vient la valeur  | Hôte de la base             |
| --------------------------- | --------------------- | --------------------------- |
| `docker compose up`         | `docker-compose.yml`  | `postgres:5432`             |
| `docker run`                | fichier `.env.docker` | `host.docker.internal:5433` |
| `npm run dev` (sans Docker) | fichier `.env`        | `localhost:5433`            |

Pour `docker run`, créer `.env.docker` à partir de `.env.example` en gardant la
variante « Docker » (sans guillemets) :

```bash
DATABASE_URL=postgresql://repere:repere@host.docker.internal:5433/repere?schema=public
```

`.env`, `.env.docker` et tout `.env.*` sont ignorés par Git **et** par
`.dockerignore`.

### Build

```bash
docker build -t repere-web .
```

### Run

La base doit être démarrée et migrée. Sans Node.js sur l'hôte, une commande
suffit (elle démarre `postgres`, migre, et charge la démo si la base est vide) :

```bash
docker compose run --rm migrate
```

Puis :

```bash
docker run --rm --name repere-web --env-file .env.docker -p 3000:3000 repere-web
```

Sous Linux, ajouter `--add-host=host.docker.internal:host-gateway`.

### Vérifier

- <http://localhost:3000> : la page d'accueil liste les lieux (lecture en base) ;
- `/connexion` avec `camille@example.com` : arrivée sur l'espace membre ;
- « Réserver un espace » : choisir un jour et une heure, confirmer — le solde de
  crédits baisse ; annuler la réservation le rétablit ;
- `/admin` avec le compte membre : accès refusé ; avec `admin@example.com` : OK ;
- <http://localhost:3000/api/mobile/v1/health> : `{"status":"ok"}` (c'est aussi
  l'URL du `HEALTHCHECK` de l'image).

### Scan

```bash
docker scout quickview repere-web
docker scout cves repere-web
```

Résultat et analyse : [Docker — sécurité & IA](#docker--sécurité--ia).

### Particularités du projet

- **Le build ne lit jamais la base.** Les pages publiques sont rendues à la
  demande (elles lisent des cookies : langue, session) et `sitemap.xml` est
  généré à la requête. C'est ce qui permet de construire l'image sans
  `DATABASE_URL`.
- **Client Prisma généré pendant `npm ci`** (`postinstall`), dans
  `src/generated/prisma`. Le dossier est exclu du contexte de build : le client
  de l'image est toujours celui généré dans l'image.
- **Les migrations ne sont pas dans l'image de l'application.** Elle ne contient
  ni la CLI Prisma ni `prisma/migrations` ; c'est le rôle de l'étape `migrate`
  du `Dockerfile`.
- **Le seed ne s'exécute que sur une base vide** dans Compose
  (`SEED_ONLY_IF_EMPTY=1`) : relancer `docker compose up` ne réinitialise ni les
  crédits ni les lieux modifiés. `npm run db:seed` garde son comportement.
- **`.env.docker` et non `.env.local`** : `next dev` lit `.env.local` en
  priorité, ce fichier détournerait donc aussi le serveur de développement.
- **Tester sur `localhost`.** En production le cookie de session est `Secure` ;
  un navigateur ne l'accepte en HTTP que sur `localhost`. Derrière une autre
  adresse, il faut du HTTPS.
- **Le build a besoin d'Internet** : `npm ci`, le moteur de migration Prisma et
  les polices (`next/font/google`) sont téléchargés pendant `docker build`.
- `npm run start` (`next start`) fonctionne toujours mais affiche un
  avertissement depuis `output: "standalone"` ; le vrai point d'entrée de
  production est `node .next/standalone/server.js`, celui de l'image.

## Docker — sécurité & IA

### Commandes de scan

```bash
docker scout quickview repere-web         # résumé par gravité
docker scout cves repere-web              # détail par paquet, version corrigée
docker scout recommendations repere-web   # image de base conseillée
```

Scans exécutés le 7 octobre 2026 (Docker Scout CLI 1.17.1), image
`linux/amd64`.

### Résultat du premier scan

Première image fonctionnelle, sur `node:24-bookworm-slim` (la base du Dockerfile
de référence, en Node 24) : **5 critiques, 21 hautes, 19 moyennes, 34 faibles**,
364 paquets indexés.

| Origine                      | Paquets                                                                                                              | Gravité                |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| Image de base (Debian 12)    | `perl`, `util-linux`, `gcc-12`, `zlib`, `glibc`…                                                                     | 4 critiques, 12 hautes |
| CLI npm fournie avec l'image | `brace-expansion`, `tar`, `ip-address`, `undici`, `http-cache-semantics` (dans `/usr/local/lib/node_modules/npm`)    | 8 hautes               |
| Application                  | `next` 16.3.5 (GHSA-vcvr-r3jv-pc5j, score 9,5, corrigée en 16.3.6) · `sharp` 0.35.4 (GHSA-wq5f-xc86-pv6w, en 0.35.5) | 1 critique, 1 haute    |

Lecture : 24 des 26 critiques et hautes ne viennent pas du code du projet mais
de ce que l'image de base embarque. `docker scout recommendations` indiquait
une base « à jour » et ne proposait aucun autre tag : une simple reconstruction
n'aurait rien changé.

### Recommandations de l'assistant IA et décisions

J'ai soumis le rapport de scan à un assistant IA. J'ai vérifié chaque
proposition par une mesure ou un test avant de la retenir.

| Proposition                                                            | Décision                   | Vérification et justification                                                                                                                                                                                                                                  |
| ---------------------------------------------------------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Changer d'image de base                                                | **Acceptée**, après mesure | Trois bases scannées : `bookworm-slim` 4C / 20H, `trixie-slim` 0C / 10H, `alpine` 0C / 9H. Alpine retenue. Vérifié que tout ce qui est natif existe en version musl (SWC, `sharp`, moteur Prisma) : build, migrations et optimisation d'images testés.         |
| Retirer npm, yarn et corepack de l'image finale                        | **Acceptée**               | L'application démarre par `node server.js`, aucun gestionnaire de paquets n'est utile à l'exécution. 8 des 9 hautes de la base Alpine venaient de là.                                                                                                          |
| Mettre `next` à jour en 16.3.6, la version corrigée indiquée           | **Modifiée**               | Passage en 16.3.8, dernier correctif de la branche 16.3, plutôt qu'une version déjà dépassée ; pas 16.4, qui est une version mineure. `sharp` suit en 0.35.5. Lint, typage et build repassés ; seuls les paquets `next` et `sharp` ont bougé dans le lockfile. |
| `apk upgrade` dans l'étape finale                                      | **Acceptée**, limitée      | Corrige `zlib` (correctif publié par Alpine après la construction de l'image de base). Limitée à l'étape `runner` ; contrepartie assumée : cette couche dépend de la date du build.                                                                            |
| Garder `generateStaticParams` en renvoyant `[]` si la base est absente | **Refusée**                | Le build passait, mais `/lieux/[slug]` répondait 500 dans le conteneur (`DYNAMIC_SERVER_USAGE` : la page lit des cookies). Trouvé en testant l'image, pas à la lecture du code. La fonction a été retirée.                                                     |
| Donner une `DATABASE_URL` factice au build pour `prisma generate`      | **Refusée**                | Une URL de base dans une commande de build, même fausse, installe la mauvaise habitude. `prisma.config.ts` lit désormais la variable sans l'exiger : `generate` ne se connecte jamais.                                                                         |
| Image « distroless »                                                   | **Refusée**                | Plus de shell : débogage et healthcheck plus difficiles à expliquer, pour un gain nul une fois le scan à zéro.                                                                                                                                                 |
| `npm audit fix --force`                                                | **Refusée**                | Change des versions majeures. Les paquets signalés (`braces`, `mysql2`, `deepmerge-ts`, `source-map-js`) appartiennent à l'outillage de build ; vérifié qu'aucun n'est présent dans l'image finale.                                                            |

### Résultat après correction

| Étape                                             | Critiques | Hautes | Moyennes | Faibles | Paquets | Taille |
| ------------------------------------------------- | --------- | ------ | -------- | ------- | ------- | ------ |
| 1. `node:24-bookworm-slim`                        | 5         | 21     | 19       | 34      | 364     | 304 Mo |
| 2. `node:24-alpine`, sans npm                     | 1         | 2      | 0        | 0       | 112     | 245 Mo |
| 3. + `next` 16.3.8, `sharp` 0.35.5, `apk upgrade` | **0**     | **0**  | **0**    | **0**   | 113     | 251 Mo |

Après chaque étape j'ai reconstruit l'image, relancé le scan, et rejoué le
parcours principal dans le conteneur sur une base vierge : connexion,
réservation, annulation, refus d'accès à `/admin` pour un membre.

J'ai aussi vérifié sur l'image finale : utilisateur `node` (non-root), aucun
fichier `.env`, aucune occurrence de `DATABASE_URL` dans `docker history`,
contexte de build de 3,85 Mo.

J'ai relancé le scan le même jour, après les dernières modifications du code
(session par jeton, écritures en transaction, images AVIF) : toujours
**0 / 0 / 0 / 0**, 113 paquets, image de 256 Mo.

Le 9 octobre 2026, j'ai relancé le scan sur cette même image, sans la
reconstruire : toujours **0 / 0 / 0 / 0**, 113 paquets.

### Limites

- Zéro vulnérabilité est une photo, prise le 7 octobre 2026 et confirmée le 9
  sur la même image. Le tag `node:24-alpine` n'est pas figé par digest et
  `apk upgrade` dépend de la date : le scan est à relancer à chaque
  reconstruction.
- L'image `migrate` n'est pas durcie : elle contient toutes les dépendances de
  développement (1,4 Go ; 12 hautes au scan, dont celles de npm). C'est un
  travail ponctuel, sans port publié, qui s'arrête après les migrations.
- Les identifiants PostgreSQL de `docker-compose.yml` sont des valeurs de
  démonstration locales. Une vraie base aurait un secret injecté par
  l'hébergeur, jamais commité.
- Pas de scan automatique en intégration continue, ni d'attestation SBOM ou de
  provenance.

## Usage de l'IA

Ce projet a été développé avec un agent IA. Il a écrit le code sous ma
direction : je cadrais le travail, je prenais les décisions techniques et je
validais chaque modification avant qu'elle soit commitée. J'ai d'abord réalisé
ce site, puis l'application mobile, avec la même méthode. Ce qui concerne
Docker est détaillé dans [Docker — sécurité & IA](#docker--sécurité--ia).

### Outils utilisés

| Outil                                           | Usage                                                                                                                                          |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| ChatGPT                                         | Rédiger le prompt de départ : je lui ai donné une trentaine de lignes décrivant ce que je voulais, il en a fait un prompt adapté à Claude Code |
| Claude Code                                     | Agent de développement dans le terminal : plan, code, tests, documentation                                                                     |
| Claude Design                                   | Maquettes, que je validais avant le développement                                                                                              |
| Jira, relié à Claude Code par un connecteur MCP | Tableau agile, sprints et tickets du projet, créés par l'agent                                                                                 |

### Le prompt de départ

Ce prompt fixait la façon de travailler avant toute ligne de code.

- **Un rôle et un cadre.** Agir en lead développeur senior, commencer en mode
  plan et me poser une trentaine de questions avant de développer. Toute
  décision technique m'était soumise.
- **Des règles écrites.** Un fichier de règles : commits en anglais, à
  l'impératif, avec un tag ; une fonctionnalité par commit ; ne rien inventer ;
  aucun commit ni push sans ma validation.
- **Des fiches de connaissances (« skills »).** Pour que l'agent travaille sur
  la version actuelle de Next.js sans refaire les mêmes recherches à chaque
  session : des fiches que je lui ai fait construire à partir de la
  documentation officielle et de sources recoupées (conventions Next.js,
  backend avec Prisma et hachage des mots de passe, design), et des fiches
  publiées par Vercel (performance React, règles d'interface).
- **Un fichier de contexte.** Il décrit le projet et ses règles, et dit quelle
  fiche consulter pour quel besoin ; à défaut, la documentation officielle. Il
  est tenu à jour au fil du projet : c'est lui qui permet de reprendre le
  travail dans une conversation neuve.
- **Des agents spécialisés.** Un agent lit les PDF des sujets avec un modèle
  plus léger, pour économiser le modèle principal ; un autre tenait le rôle de
  product owner.
- **Une limite de contexte.** Au-delà de 60 % de la fenêtre de contexte, la
  conversation est compactée, puis le contexte est rechargé depuis le fichier
  de contexte.

Les règles, les fiches, le fichier de contexte et les agents sont sur mon
poste : je ne les ai pas versionnés dans ce dépôt.

### Tâches confiées, et ce que j'ai gardé

| Confié à l'agent                                                                | Gardé pour moi                                                    |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Proposer le plan et l'architecture                                              | Répondre aux questions du plan et trancher chaque choix technique |
| Écrire le code : pages, Server Actions, API mobile, schéma et migrations Prisma | Relire et valider chaque modification avant qu'elle soit commitée |
| Écrire les tests unitaires, le `Dockerfile`, la documentation                   | Vérifier que le résultat correspond à ce que j'avais demandé      |
| Analyser le scan Docker Scout et l'audit Lighthouse, proposer des corrections   | Accepter, modifier ou refuser chaque proposition                  |

### Une décision de l'IA que j'ai refusée

Pour que l'image Docker se construise sans base de données, l'agent a proposé
de garder `generateStaticParams` sur `/lieux/[slug]` en renvoyant une liste vide
quand la base est absente. Le build passait, mais la page répondait 500 dans le
conteneur (`DYNAMIC_SERVER_USAGE` : elle lit des cookies). Le problème est
apparu en testant l'image, pas à la lecture du code. La fonction a été retirée.

Les sept autres propositions, acceptées, modifiées ou refusées, sont dans le
tableau
[Recommandations de l'assistant IA et décisions](#recommandations-de-lassistant-ia-et-décisions).

### Une partie que je peux expliquer intégralement

L'authentification et l'autorisation : la session par jeton dont seule
l'empreinte est en base, les gardes `requireUser`, `requireOnboarded` et
`requireAdmin` de `src/lib/auth/session.ts`, et leur rappel en première ligne de
chaque Server Action. Détail :
[docs/authentification-et-securite.md](docs/authentification-et-securite.md).

## Limites connues

Ce que le projet ne fait pas, ou fait de façon imparfaite. Chaque point est
détaillé dans le document cité.

**Livrables**

- **Pas de déploiement en ligne.** L'application se lance en local, en
  développement ou par l'image Docker de production. L'adresse du site dans
  `src/lib/site-config.ts` (`https://repere.example.com`) est une adresse
  d'exemple, utilisée par `sitemap.xml` et `robots.txt`.
- **Des tests unitaires, pas de tests de bout en bout.** 80 tests couvrent les
  règles métier écrites en fonctions pures (créneaux, heures d'ouverture,
  règles d'arrivée, validation des formulaires, catalogue). Les parcours
  complets dans le navigateur sont rejoués à la main.
  ([docs/git-et-github.md](docs/git-et-github.md#tests))
- Pas d'intégration continue : les vérifications sont lancées à la main avant
  chaque commit.

**Sécurité** ([docs/authentification-et-securite.md](docs/authentification-et-securite.md#limites-connues))

- Le frein sur les tentatives de connexion vit en mémoire du processus : il est
  remis à zéro au redémarrage et ne serait pas partagé entre plusieurs
  instances.
- Pas de réinitialisation de mot de passe ni de vérification d'adresse e-mail :
  l'application n'envoie aucun e-mail.
- La position envoyée pour valider une arrivée peut être falsifiée.

**Fonctionnel**

- Le back-office ne permet pas de supprimer un lieu, ni de modifier un espace
  existant autrement qu'en changeant son statut.
- Trois colonnes de la base sont enregistrées mais pas encore exploitées.
  ([docs/base-de-donnees.md](docs/base-de-donnees.md#limites-connues))

**Mobile**

- Le NFC n'est pas implémenté. L'application mobile utilise le QR code et la
  géolocalisation.

## Documentation

| Document                                                                     | Contenu                                                                    |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| [docs/architecture.md](docs/architecture.md)                                 | Groupes de routes, layouts, toutes les routes, dossiers, où intervenir     |
| [docs/fonctionnalites.md](docs/fonctionnalites.md)                           | Fonctionnalités, parcours de bout en bout, règles métier, scénario de démo |
| [docs/choix-de-rendu.md](docs/choix-de-rendu.md)                             | Serveur ou client, lecture des données, Server Actions, Route Handlers     |
| [docs/base-de-donnees.md](docs/base-de-donnees.md)                           | Schéma de données, relations, migrations, seed, commandes                  |
| [docs/authentification-et-securite.md](docs/authentification-et-securite.md) | Session, gardes serveur, autorisations, secrets, limites                   |
| [docs/interface-et-etats.md](docs/interface-et-etats.md)                     | Direction visuelle, responsive, états d'interface, accessibilité, langues  |
| [docs/performance-cache-seo.md](docs/performance-cache-seo.md)               | Cache et invalidation, images, SEO, audit Lighthouse                       |
| [docs/api-mobile.md](docs/api-mobile.md)                                     | Contrat de l'API de l'application mobile                                   |
| [docs/docker.md](docs/docker.md)                                             | Dockerfile expliqué, `.dockerignore`, Compose, questions de soutenance     |
| [docs/git-et-github.md](docs/git-et-github.md)                               | Branches, forme des commits, vérifications, qualité du code                |
