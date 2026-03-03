# ----------- BUILD STAGE -----------
FROM oven/bun:1 AS build

WORKDIR /app

COPY package.json bun.lock ./
COPY public ./public

RUN bun install --frozen-lockfile

COPY . .

ENV NODE_ENV=production
RUN bun run build

# ----------- FINAL STAGE -----------
FROM oven/bun:1-slim

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/dist .
COPY --from=build /app/public ./public

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD bun -e "const r = await fetch('http://localhost:3000/api/health'); process.exit(r.ok ? 0 : 1)"

CMD ["bun", "server.js"]
