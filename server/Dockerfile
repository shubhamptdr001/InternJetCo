# ─── Stage 1: Build ──────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first (layer caching)
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy rest of source
COPY . .

# ─── Stage 2: Production image ───────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .

# Don't run as root
USER appuser

EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "server.js"]
