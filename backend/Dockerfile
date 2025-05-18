# STAGE 1: Build stage
FROM node:18-slim AS builder

WORKDIR /app

# Copy package files and install all dependencies including devDependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

# STAGE 2: Production stage
FROM node:18-slim AS production

WORKDIR /app

# Only copy package files and install production dependencies
COPY package*.json ./
ENV NODE_ENV=production
RUN npm install --omit=dev

# Copy built app from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env* ./

# Expose app port
EXPOSE 5000

# Healthcheck (optional)
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s \
  CMD curl -f http://localhost:5000/api || exit 1

# Start the app
CMD ["node", "dist/main"]
