# Docker : explication de l'image et de la pile

Le README contient les commandes pour construire, lancer et scanner l'image
(sections [Docker](../README.md#docker) et
[Docker — sécurité & IA](../README.md#docker--sécurité--ia)). Ce document
explique **pourquoi** chaque fichier est écrit ainsi : le `Dockerfile` ligne
par ligne, le `.dockerignore`, le cache des couches, Compose, et les variables.

## Quatre notions

| Notion                       | Dans ce projet                                                                                                                                                               |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Image**                    | `repere-web` : un paquet figé, en lecture seule, qui contient Node.js et l'application déjà construite. Elle est produite par `docker build`.                                |
| **Conteneur**                | Une exécution de l'image : un processus isolé (`node server.js`). On peut en lancer plusieurs à partir de la même image, les arrêter, les supprimer : l'image ne change pas. |
| **Port**                     | L'application écoute sur le port 3000 **dans** le conteneur. `-p 3000:3000` (ou `ports:` dans Compose) relie un port de la machine hôte à ce port du conteneur.              |
| **Variable d'environnement** | `DATABASE_URL` n'est pas dans l'image. Elle est donnée au conteneur à son démarrage (`--env-file`, ou `environment:` dans Compose).                                          |

## Le `Dockerfile`, étape par étape

Le fichier contient quatre étapes (build multi-étapes). L'idée : construire
avec tout ce qu'il faut, livrer avec le minimum.

```
deps ──> builder ──> runner    l'image de l'application (dernière étape)
  └────> migrate               tâche ponctuelle : migrations + données de démo
```

### Étape `deps` : les dépendances

```dockerfile
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma/schema.prisma ./prisma/schema.prisma
RUN npm ci
```

| Instruction                             | Explication                                                                                                                                                                                                                                   |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FROM node:24-alpine`                   | Image de départ : Node.js 24 (la version que j'utilise en développement) sur Alpine Linux. J'ai choisi Alpine après avoir scanné trois bases : c'est celle qui embarque le moins de paquets système, donc le moins de vulnérabilités connues. |
| `AS deps`                               | Donne un nom à l'étape, pour que les suivantes puissent partir d'elle.                                                                                                                                                                        |
| `WORKDIR /app`                          | Dossier de travail dans l'image : les commandes suivantes s'y exécutent, et il est créé s'il n'existe pas.                                                                                                                                    |
| `COPY package.json package-lock.json …` | Je ne copie **que** ce dont `npm ci` a besoin. Voir « cache des couches » plus bas.                                                                                                                                                           |
| `COPY prisma/schema.prisma`             | Le script `postinstall` lance `prisma generate`, qui lit le schéma pour générer le client.                                                                                                                                                    |
| `RUN npm ci`                            | Installe exactement les versions du fichier de verrouillage. Plus strict et reproductible que `npm install`.                                                                                                                                  |

### Étape `migrate` : migrations et données de démonstration

```dockerfile
FROM deps AS migrate
COPY prisma ./prisma
ENV SEED_ONLY_IF_EMPTY=1
USER node
CMD ["sh", "-c", "npx prisma migrate deploy && node prisma/seed.ts"]
```

Cette étape part de `deps` parce qu'elle a besoin de la CLI Prisma, qui est une
dépendance de développement. Elle applique les migrations, puis charge les
données de démonstration **seulement si la base est vide**
(`SEED_ONLY_IF_EMPTY=1`). Elle est séparée de l'image de l'application : le
serveur n'a besoin ni de la CLI Prisma ni des fichiers de migration pour
tourner.

### Étape `builder` : le build de production

```dockerfile
FROM deps AS builder
ENV NEXT_TELEMETRY_DISABLED=1
COPY . .
RUN npm run build
```

| Instruction         | Explication                                                                                                                                                                                              |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FROM deps`         | Réutilise les dépendances déjà installées.                                                                                                                                                               |
| `COPY . .`          | Copie le reste du projet, **moins** ce que liste `.dockerignore`.                                                                                                                                        |
| `RUN npm run build` | `next build`. Avec `output: "standalone"` dans `next.config.ts`, Next.js écrit `.next/standalone` : un serveur autonome (`server.js`) avec seulement les fichiers de `node_modules` réellement utilisés. |

Le build n'a besoin d'aucune base ni d'aucun secret : aucune page ne lit la
base pendant `next build`.

### Étape `runner` : ce qui est livré

```dockerfile
FROM node:24-alpine AS runner
WORKDIR /app

RUN apk upgrade --no-cache \
  && rm -rf /usr/local/lib/node_modules /opt/yarn-* \
  /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack \
  /usr/local/bin/yarn /usr/local/bin/yarnpkg

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:' + process.env.PORT + '/api/mobile/v1/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"]
CMD ["node", "server.js"]
```

| Instruction                             | Explication                                                                                                                                                                                                                |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FROM node:24-alpine AS runner`         | On **repart d'une image vide** : rien de `deps` ni de `builder` n'est gardé, sauf ce qu'on copie explicitement. Le code source, les dépendances de développement et le cache de build restent dans les étapes précédentes. |
| `RUN apk upgrade --no-cache`            | Applique les correctifs de sécurité publiés par Alpine depuis la construction de l'image de base.                                                                                                                          |
| `rm -rf … npm … yarn …`                 | Le serveur démarre avec `node server.js` : aucun gestionnaire de paquets n'est utile à l'exécution. npm et yarn embarquent leurs propres dépendances, où se trouvaient la plupart des vulnérabilités de l'image de base.   |
| `ENV NODE_ENV=production`               | Mode production de Next.js et de React. Rend aussi le cookie de session `Secure`.                                                                                                                                          |
| `ENV PORT=3000` et `HOSTNAME="0.0.0.0"` | Le serveur écoute sur toutes les interfaces du conteneur, pas seulement sur son propre `localhost`. Sans cela, le port publié ne répondrait pas depuis l'hôte.                                                             |
| `COPY --from=builder …`                 | Trois copies depuis l'étape `builder` : les fichiers publics, le serveur autonome, les fichiers statiques. La sortie `standalone` n'inclut pas `public` ni `.next/static` : il faut les copier à côté.                     |
| `--chown=node:node`                     | Les fichiers appartiennent à l'utilisateur non privilégié qui va lancer le serveur.                                                                                                                                        |
| `USER node`                             | Le serveur ne tourne pas en `root`. Si l'application était compromise, l'attaquant n'aurait pas les droits d'administration dans le conteneur. L'utilisateur `node` est fourni par l'image officielle.                     |
| `EXPOSE 3000`                           | **Documentation** : indique sur quel port l'application écoute. Il ne publie rien.                                                                                                                                         |
| `HEALTHCHECK`                           | Docker interroge `/api/mobile/v1/health` toutes les 30 secondes et marque le conteneur `healthy` quand le serveur répond. Écrit avec `node` : l'image n'a pas `curl`.                                                      |
| `CMD ["node", "server.js"]`             | La commande lancée au démarrage du conteneur. Ce n'est ni `npm run dev` ni `next start` : c'est le serveur autonome produit par le build.                                                                                  |

`runner` est la **dernière** étape du fichier : c'est elle que produit
`docker build .` sans option.

## `.dockerignore` et contexte de build

Quand on lance `docker build .`, Docker envoie d'abord le dossier courant au
moteur : c'est le **contexte de build**. `.dockerignore` liste ce qui n'en fait
pas partie. Un fichier absent du contexte ne peut pas être copié dans une
image, même par `COPY . .`.

| Exclu                                                       | Pourquoi                                                                                 |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `node_modules`                                              | Installé sur l'hôte (binaires Windows ou macOS) : l'image installe les siens, pour Linux |
| `.next`, `out`, `build`, `dist`                             | Résultats d'un build local : l'image fait le sien                                        |
| `src/generated`                                             | Client Prisma généré sur l'hôte : régénéré dans l'image                                  |
| `.env`, `.env.*`                                            | Secrets et configuration locale : ils ne doivent jamais entrer dans une couche d'image   |
| `.git`                                                      | Historique complet, inutile à l'exécution                                                |
| `Dockerfile`, `docker-compose.yml`, `docs`, `*.md`, `*.pdf` | Inutiles pour construire ou lancer l'application                                         |
| `.*`                                                        | Tout autre fichier ou dossier caché à la racine (configuration d'éditeur et d'outils)    |

Résultat mesuré : le contexte envoyé fait 3,85 Mo.

Trois bénéfices : un build plus rapide (moins de données envoyées), une image
plus propre, et aucun risque qu'un secret local se retrouve dans une couche.

## Le cache des couches

Chaque instruction du `Dockerfile` produit une couche. Docker réutilise une
couche tant que l'instruction et les fichiers qu'elle copie n'ont pas changé ;
dès qu'une couche change, toutes les suivantes sont refaites.

C'est pour cela que je copie `package.json` et `package-lock.json` **avant** le
reste du code :

```dockerfile
COPY package.json package-lock.json prisma.config.ts ./   # change rarement
COPY prisma/schema.prisma ./prisma/schema.prisma          # change rarement
RUN npm ci                                                 # long
# …
COPY . .                                                   # change à chaque modification
RUN npm run build
```

Quand je modifie un fichier de `src/`, les couches de `deps` sont reprises du
cache : `npm ci` n'est pas relancé. Si `COPY . .` était placé avant
`npm ci`, la moindre modification du code réinstallerait toutes les
dépendances.

## Docker Compose

`docker-compose.yml` décrit trois services.

| Service    | Rôle                                                                       | Démarre quand                                                          |
| ---------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `postgres` | PostgreSQL 16, données dans un volume nommé                                | —                                                                      |
| `migrate`  | Étape `migrate` du `Dockerfile` : migrations puis données de démonstration | `postgres` est en bonne santé (`service_healthy`)                      |
| `web`      | Étape `runner` : l'application                                             | `migrate` s'est terminé avec succès (`service_completed_successfully`) |

Cet ordre garantit que l'application ne démarre jamais sur une base sans
tables. `migrate` s'arrête une fois son travail fait : le voir à l'état
`Exited (0)` est normal.

Le volume `repere-postgres-data` conserve les données entre deux lancements.
`docker compose down` arrête tout sans y toucher ; seul `docker compose down
-v` le supprime.

`npm run db:up` ne démarre que `postgres` : c'est l'usage de tous les jours,
avec l'application lancée sur l'hôte par `npm run dev`.

## Variables et secrets

Une seule variable : `DATABASE_URL`.

| Moment                 | Ce qui se passe                                                       |
| ---------------------- | --------------------------------------------------------------------- |
| `docker build`         | Aucune variable n'est nécessaire, aucun `ARG` ne transporte de secret |
| Démarrage du conteneur | `DATABASE_URL` est lue par `src/lib/db/prisma.ts`                     |

La valeur dépend de **l'endroit d'où l'on parle à la base**. C'est le point à
ne pas confondre.

| Qui se connecte                     | Hôte de la base             | Pourquoi                                                                     |
| ----------------------------------- | --------------------------- | ---------------------------------------------------------------------------- |
| `npm run dev` sur la machine hôte   | `localhost:5433`            | Le port 5432 du conteneur PostgreSQL est publié sur le 5433 de l'hôte        |
| Le service `web` de Compose         | `postgres:5432`             | Dans le réseau Compose, un service se joint par son nom et son propre port   |
| Un conteneur lancé par `docker run` | `host.docker.internal:5433` | Dans un conteneur, `localhost` désigne le conteneur lui-même, pas la machine |

Le même raisonnement vaut pour un téléphone : `localhost` y désigne le
téléphone. L'application mobile joint le serveur par l'adresse de la machine
sur le réseau ou par un tunnel (voir le dépôt de l'application mobile).

Pourquoi `.env` n'est pas copié dans l'image : une image se partage et
s'inspecte. Tout fichier copié reste lisible dans ses couches, même s'il est
supprimé ensuite. J'ai vérifié sur l'image finale qu'elle ne contient aucun
fichier `.env` et que `docker history` ne montre aucune occurrence de
`DATABASE_URL`.

## Ce que j'ai dû changer dans l'application

Dockeriser a demandé cinq modifications du code. Les quatre premières
appliquent une même règle : **le build ne doit pas dépendre de la base**.

| Fichier                                     | Modification                                                    | Raison                                                                                                                            |
| ------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `next.config.ts`                            | `output: "standalone"`                                          | Produire le serveur autonome copié dans l'image                                                                                   |
| `src/app/sitemap.ts`                        | `export const dynamic = "force-dynamic"`                        | Le plan du site lisait les lieux pendant le build                                                                                 |
| `src/app/(marketing)/lieux/[slug]/page.tsx` | Suppression de `generateStaticParams`                           | La liste des slugs était lue en base au build ; de plus la page lit des cookies, elle ne peut pas être statique                   |
| `prisma.config.ts`                          | `process.env.DATABASE_URL ?? ""` au lieu de l'assistant `env()` | `env()` lève une erreur si la variable manque, ce qui faisait échouer `prisma generate` pendant `npm ci` dans l'image             |
| `src/app/(auth)/deconnexion/route.ts`       | Redirection avec un en-tête `Location` relatif                  | Dans l'image le serveur écoute sur `0.0.0.0` : l'URL absolue construite depuis `request.url` renvoyait vers `http://0.0.0.0:3000` |

La dernière ligne est un bug que je n'ai trouvé qu'en utilisant l'application
dans le conteneur : il n'apparaissait pas en développement.

## Questions de soutenance

**Pourquoi ce `FROM` ?** `node:24-alpine` : même version de Node.js qu'en
développement, et la base qui présentait le moins de vulnérabilités dans mes
scans (0 critique et 9 hautes, contre 4 critiques et 20 hautes pour
`node:24-bookworm-slim`).

**Que fait `WORKDIR` ?** Il fixe le dossier courant dans l'image pour les
instructions suivantes et pour le processus lancé par `CMD`.

**Pourquoi copier `package*.json` avant `COPY . .` ?** Pour le cache :
`npm ci` n'est relancé que si les dépendances changent, pas à chaque
modification du code.

**Pourquoi `.dockerignore` est important ?** Il empêche d'envoyer
`node_modules`, `.git` et surtout `.env` dans le contexte de build. Build plus
rapide, image plus propre, pas de fuite de secret.

**Où sont injectées les variables ?** Au démarrage du conteneur :
`environment:` dans `docker-compose.yml`, ou `--env-file .env.docker` avec
`docker run`. Jamais pendant le build.

**Pourquoi ne pas copier `.env` ?** Parce qu'il resterait dans une couche de
l'image, lisible par quiconque obtient l'image.

**Quelle différence entre `EXPOSE` et `ports` ?** `EXPOSE` documente le port
d'écoute dans l'image et ne publie rien. `ports` (ou `-p`) relie réellement un
port de l'hôte à un port du conteneur. `EXPOSE 3000` sans `-p 3000:3000` :
l'application n'est pas joignable depuis l'hôte.

**Que montre le scan Docker Scout ?** Les vulnérabilités connues, par gravité
et par paquet, et la version qui les corrige. Sur ma première image, 24 des 26
vulnérabilités critiques et hautes venaient de l'image de base et de npm, pas
de mon code. Le détail est dans le
[README](../README.md#docker--sécurité--ia).

**Qu'est-ce que l'IA a proposé, et qu'ai-je vérifié ?** Huit propositions, dont
quatre refusées. Chacune a été vérifiée par un scan, un build ou un test dans
le conteneur avant d'être retenue. Le tableau complet est dans le
[README](../README.md#recommandations-de-lassistant-ia-et-décisions).

## Limites

- Le tag `node:24-alpine` n'est pas figé par son empreinte, et `apk upgrade`
  dépend de la date du build : le résultat du scan est à refaire à chaque
  reconstruction.
- L'image `migrate` n'est pas durcie : elle contient les dépendances de
  développement. C'est une tâche ponctuelle, sans port publié.
- Les identifiants PostgreSQL de `docker-compose.yml` sont des valeurs de
  démonstration.
- Pas de build ni de scan automatiques dans une intégration continue, pas de
  registre d'images.
