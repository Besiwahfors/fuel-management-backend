# Stage 1: Build
FROM node:18-slim AS builder

# Install essential tools
RUN apt-get update && \
    apt-get install -y python3 make g++ && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci --include=dev

COPY . .
RUN npm run build

# Stage 2: Production
FROM node:18-slim

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

EXPOSE 3000
CMD ["node", "dist/main.js"]