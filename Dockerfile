# Stage 1: Build environment
FROM node:18-bookworm-slim AS builder

# Install build essentials
RUN apt-get update && \
    apt-get install -y python3 make g++ && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci --include=dev

COPY . .
RUN npm run build

# Rebuild native modules specifically
RUN npm rebuild bcrypt --update-binary

# Stage 2: Production image
FROM node:18-bookworm-slim

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Production environment variables
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000
CMD ["node", "dist/main.js"]