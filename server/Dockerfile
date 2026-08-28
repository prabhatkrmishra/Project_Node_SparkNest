FROM node:20-alpine AS base
WORKDIR /app

# Needed for sharp and bcrypt native builds + healthcheck
RUN apk add --no-cache python3 make g++ vips-dev wget

COPY package.json ./
# Workspaces use root lockfile; use npm install when no local lockfile
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

COPY . .

# Run as non-root and ensure data volume is writable
RUN addgroup -S appgroup && adduser -S appuser -G appgroup \
  && mkdir -p /data && chown -R appuser:appgroup /app /data
USER appuser

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "server.js"]
