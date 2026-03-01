# ── HallGuardian Backend Dockerfile ──────────────────────────────────────────
# Builds a minimal production image for the Express + SQLite backend.
# Deployed on Railway, Render, Fly.io, or any Docker host.
#
# Build:  docker build -t hallguardian-backend .
# Run:    docker run -p 4000:4000 -v $(pwd)/data:/data \
#           -e JWT_SECRET=... -e DB_FILE=/data/hallguardian.db \
#           hallguardian-backend

FROM node:20-alpine AS base

# Install build tools needed by better-sqlite3 native module
RUN apk add --no-cache python3 make g++

WORKDIR /app

# ── Install dependencies ──────────────────────────────────────────────────────
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ── Copy source ───────────────────────────────────────────────────────────────
COPY . .

# ── Persistent data directory ─────────────────────────────────────────────────
# Mount a volume at /data in production so the SQLite file survives redeploys.
# e.g.  railway volume add --mount /data
RUN mkdir -p /data

# ── Non-root user for security ────────────────────────────────────────────────
RUN addgroup -S hg && adduser -S hg -G hg
RUN chown -R hg:hg /app /data
USER hg

EXPOSE 4000

# Default DB path points to the persistent volume mount
ENV DB_FILE=/data/hallguardian.db
ENV NODE_ENV=production

CMD ["node", "server.js"]
