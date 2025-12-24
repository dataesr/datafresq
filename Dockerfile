# ----------- BUILD STAGE -----------
FROM oven/bun:1 AS build

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile

COPY . .

ENV NODE_ENV=production
RUN bun build --target=bun --production --outdir=dist ./server.ts

# ----------- FINAL STAGE -----------
FROM oven/bun:1-slim

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/dist .
COPY --from=build /app/public ./public

EXPOSE 3000

CMD ["bun", "server.js"]
