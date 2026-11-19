FROM node:20-alpine AS base
WORKDIR /app

# Needed for sharp and bcrypt native builds + healthcheck
RUN apk add --no-cache python3 make g++ vips-dev wget

# The repo is an npm workspace. Install from the root lockfile so image
# dependencies match local development instead of resolving fresh versions.
COPY package.json package-lock.json ./
COPY server/package.json ./server/package.json
COPY client/package.json ./client/package.json
RUN npm ci --omit=dev --workspace=server --include-workspace-root=false

COPY server ./server

# Run as non-root and ensure data volume is writable
RUN addgroup -S appgroup && adduser -S appuser -G appgroup \
  && mkdir -p /data && chown -R appuser:appgroup /app /data
USER appuser

WORKDIR /app/server
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "server.js"]
