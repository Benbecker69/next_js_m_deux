# Production image for Repère (Next.js, `output: "standalone"`).
#
#   deps ──> builder ──> runner    the app image (default target, last stage)
#     └────> migrate               one-shot job: migrations + demo data
#
# Nothing secret is needed to build: DATABASE_URL is only read when a
# container starts (`docker run --env-file …`, or Compose `environment`).

# ---- deps: dependencies + generated Prisma client --------------------------
# Alpine rather than Debian slim: chosen after scanning both with Docker Scout
# (far fewer OS packages, so far fewer known vulnerabilities — see README,
# "Docker — sécurité & IA"). Node 24 = the version used in development.
FROM node:24-alpine AS deps
WORKDIR /app

# Only what `npm ci` needs. As long as these files do not change, Docker
# reuses the cached layer below instead of reinstalling on every code edit.
# The Prisma schema is part of it because `postinstall` runs `prisma generate`
# (which writes the client to src/generated/prisma).
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma/schema.prisma ./prisma/schema.prisma
RUN npm ci

# ---- migrate: applies the migrations, then seeds an empty database ----------
# Kept out of the app image: it needs the Prisma CLI (a devDependency) and the
# migration files, which the running app never uses.
FROM deps AS migrate
COPY prisma ./prisma
# The seed only fills a database that has no user yet (see prisma/seed.ts).
ENV SEED_ONLY_IF_EMPTY=1
USER node
CMD ["sh", "-c", "npx prisma migrate deploy && node prisma/seed.ts"]

# ---- builder: `next build` ---------------------------------------------------
FROM deps AS builder
ENV NEXT_TELEMETRY_DISABLED=1
# The rest of the project (minus everything in .dockerignore).
COPY . .
RUN npm run build

# ---- runner: what actually runs in production ---------------------------------
FROM node:24-alpine AS runner
WORKDIR /app

# Two hardening steps, both decided from the Docker Scout report:
# - `apk upgrade`: takes the security fixes Alpine published after this base
#   image was built (zlib at the time of writing). Only done here, in the
#   image that ships.
# - the app is started with `node server.js`: no package manager is needed at
#   runtime. npm and yarn ship their own dependencies, which is where most of
#   the findings of the base image were — out of the final image they go.
RUN apk upgrade --no-cache \
  && rm -rf /usr/local/lib/node_modules /opt/yarn-* \
  /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack \
  /usr/local/bin/yarn /usr/local/bin/yarnpkg

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# The standalone server reads these two: listen on every interface of the
# container (not only its own localhost), on port 3000.
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# `standalone` = server.js + the traced node_modules; static assets and
# `public` are not part of it and are copied next to it.
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

# Unprivileged user shipped with the official Node image (not root).
USER node

# Documentation only: the port is published with `-p` / Compose `ports`.
EXPOSE 3000

# Docker marks the container "healthy" once the server answers.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:' + process.env.PORT + '/api/mobile/v1/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"]

# Not `npm run dev`, not even `next start`: the standalone server directly.
CMD ["node", "server.js"]
