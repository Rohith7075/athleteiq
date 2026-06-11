# ── AthleteIQ Dockerfile ─────────────────────
# Build with: docker build -t athleteiq .
# Run with:   docker run -p 3000:3000 athleteiq

# ── Stage 1: Build ────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY athleteiq/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy source files
COPY athleteiq/ .

# Build the Next.js app
RUN npm run build

# ── Stage 2: Production Server ────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Set to production
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built assets from builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000

CMD ["node", "server.js"]