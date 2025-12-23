# ----------- BUILD STAGE -----------
FROM oven/bun:1 AS build

WORKDIR /app

# Copy dependency files first for better layer caching
COPY package.json bun.lock ./

# Install all dependencies (including dev for build)
RUN bun install --frozen-lockfile

COPY . .

# Build fullstack application (bundles server + client assets)
ENV NODE_ENV=production
RUN bun build --target=bun --production --outdir=dist ./server.ts

# ----------- FINAL STAGE -----------
FROM oven/bun:1-slim

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/dist .
COPY --from=build /app/src/emails/assets ./src/emails/assets

EXPOSE 3000

CMD ["bun", "server.js"]
