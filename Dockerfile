# Multi-stage build for PawfectMatch Server
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY server/package.json ./server/
COPY packages/*/package.json ./packages/

# Install dependencies
FROM base AS dependencies
RUN pnpm install --frozen-lockfile

# Build stage
FROM base AS build
COPY --from=dependencies /app/node_modules ./node_modules
COPY server ./server
COPY packages ./packages

# Set environment variables
ENV NODE_ENV=production

# Build server
WORKDIR /app/server
RUN pnpm build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy production files
COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/server/package.json ./server/package.json
COPY --from=build /app/node_modules ./node_modules

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

WORKDIR /app/server

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start server
CMD ["node", "dist/index.js"]

