FROM node:20-alpine AS builder
WORKDIR /app

# Install from the workspace root lockfile for reproducible client builds.
COPY package.json package-lock.json ./
COPY client/package.json ./client/package.json
COPY server/package.json ./server/package.json
RUN npm ci --workspace=client --include-workspace-root=false

COPY client ./client

# Relative URL: nginx serves the SPA and proxies /api/ to the server.
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm --workspace=client run build

FROM nginx:alpine
COPY --from=builder /app/client/dist /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://localhost/ || exit 1
