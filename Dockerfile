FROM node:22-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm install --frozen-lockfile 2>/dev/null || npm install

# Build
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production
FROM base AS runtime
ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=production

COPY --from=build /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=10s --start-period=60s --retries=5 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD node -e "require('fs').existsSync('./dist/server/entry.mjs') || (console.error('Build missing: dist/server/entry.mjs not found') || process.exit(1))" && node ./dist/server/entry.mjs
