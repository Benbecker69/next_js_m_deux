# Repère

Plateforme de réservation d'espaces de coworking : site public (lieux, tarifs),
espace membre (réservation par créneau, crédits, arrivées), back-office
d'administration, et une API pour l'application mobile.

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · PostgreSQL 16
· Prisma 7.

## Lancer en local (développement)

Pré-requis : Node.js 24, Docker (pour PostgreSQL).

```bash
cp .env.example .env   # DATABASE_URL du PostgreSQL local
npm install            # installe et génère le client Prisma (postinstall)
npm run db:up          # démarre PostgreSQL dans Docker (port hôte 5433)
npm run db:migrate     # applique les migrations
npm run db:seed        # données de démonstration
npm run dev            # http://localhost:3000
```

Détail des choix et des commandes de base de données :
[docs/base-de-donnees.md](docs/base-de-donnees.md).

## Comptes de démonstration

Créés par le seed, mot de passe `demo1234` pour les deux :

| Rôle           | E-mail                |
| -------------- | --------------------- |
| Membre         | `camille@example.com` |
| Administrateur | `admin@example.com`   |

## Docker

L'application est livrée en image de production : build multi-étapes, sortie
`standalone` de Next.js, utilisateur non-root, aucun secret dans l'image.

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

Le rapport de scan a été soumis à un assistant IA. Chaque proposition a été
vérifiée par une mesure ou un test avant d'être retenue.

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

Après chaque étape l'image a été reconstruite, rescannée, et le parcours
principal rejoué dans le conteneur sur une base vierge : connexion, réservation,
annulation, refus d'accès à `/admin` pour un membre.

Vérifié aussi sur l'image finale : utilisateur `node` (non-root), aucun fichier
`.env`, aucune occurrence de `DATABASE_URL` dans `docker history`, contexte de
build de 3,85 Mo.

### Limites

- Zéro vulnérabilité est une photo au 7 octobre 2026. Le tag `node:24-alpine`
  n'est pas figé par digest et `apk upgrade` dépend de la date : le scan est à
  relancer à chaque reconstruction.
- L'image `migrate` n'est pas durcie : elle contient toutes les dépendances de
  développement (1,4 Go ; 12 hautes au scan, dont celles de npm). C'est un
  travail ponctuel, sans port publié, qui s'arrête après les migrations.
- Les identifiants PostgreSQL de `docker-compose.yml` sont des valeurs de
  démonstration locales. Une vraie base aurait un secret injecté par
  l'hébergeur, jamais commité.
- Pas de scan automatique en intégration continue, ni d'attestation SBOM ou de
  provenance.

## Documentation

- [docs/base-de-donnees.md](docs/base-de-donnees.md) — PostgreSQL, Prisma,
  commandes
- [docs/choix-de-rendu.md](docs/choix-de-rendu.md) — choix serveur / client /
  cache
- [docs/api-mobile.md](docs/api-mobile.md) — API de l'application mobile
