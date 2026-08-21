# syntax=docker/dockerfile:1

# Rebuild the source code only when needed
FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
# Install dependencies
RUN npm ci

# Copy remaining source code
COPY . .

# Generate Prisma Client (needed for build)
RUN npx prisma generate

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image, copy all the files and run next
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3000

# Install required packages for better-sqlite3
RUN apk add --no-cache python3 make g++ sqlite

# You only need to copy next.config.ts if you are NOT using standalone
# But since we configured output: 'standalone', we copy the standalone folder
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Ensure the app can write to public/storage and root for DB
RUN mkdir -p /app/public/storage && chmod -R 777 /app/public/storage
RUN chmod -R 777 /app

EXPOSE 3000

# Start the standalone server
CMD ["node", "server.js"]
