# ---- Stage 1: build ----
# Full dependency set (incl. dev) to generate the Prisma client and build Next.js.
FROM node:26-alpine AS builder

RUN apk add --no-cache openssl

WORKDIR /app

# Dependencies first so this layer is cached until the lockfile changes
COPY package*.json ./
RUN npm ci

# Everything else (see .dockerignore)
COPY . .

RUN npx prisma generate
RUN npm run build

# ---- Stage 2: production dependencies ----
# Dev dependencies (vitest, playwright, tsx, ...) are never installed here. The
# prisma CLI is a regular dependency, so migrations can run in the image.
FROM node:26-alpine AS prod-deps

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# npm auto-installs Playwright as an optional peer of next; the runtime doesn't
# use it, and it drags the test framework back into the image.
RUN rm -rf node_modules/@playwright node_modules/playwright node_modules/playwright-core

# ---- Stage 3: runtime ----
FROM node:26-alpine AS runner

# Prisma's query engine needs openssl at runtime
RUN apk upgrade --no-cache && apk add --no-cache openssl

WORKDIR /app

ENV NODE_ENV=production

# Nothing at runtime needs npm: the app starts via node, and migrations run
# from the locked prisma CLI in node_modules (a regular dependency for that
# reason). Removing npm drops its bundled packages from the image.
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
# The Prisma client is generated into lib/generated/prisma (see schema.prisma),
# along with the query engine it loads at runtime.
COPY --from=builder /app/lib/generated/prisma ./lib/generated/prisma
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts

# Uploaded images and files are stored here. Mount a persistent volume at
# this path, otherwise uploads are lost when the container is replaced.
ENV UPLOAD_DIR=/data/uploads
RUN mkdir -p /data/uploads

# next start listens on PORT.
ENV PORT=3000
EXPOSE 3000

CMD ["node", "node_modules/next/dist/bin/next", "start"]
