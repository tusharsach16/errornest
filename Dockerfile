# Stage 1: Install all dependencies (including devDependencies)
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
# Run npm ci with --ignore-scripts to prevent postinstall (prisma generate) from running
# before the prisma schema files are copied.
RUN npm ci --ignore-scripts

# Stage 2: Build the application
FROM node:20-alpine AS builder
# Install openssl so prisma can detect the system's OpenSSL version correctly
RUN apk add --no-cache openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Dummy build-time environment variables to satisfy env verification
ARG DATABASE_URL="postgresql://ci:ci@localhost:5432/ci"
ARG AUTH_SECRET="ci-only-secret-not-used-in-real-deploy-000000"
ENV DATABASE_URL=$DATABASE_URL
ENV AUTH_SECRET=$AUTH_SECRET

RUN npx prisma generate
RUN npm run build

# Stage 3: Runner stage (minimal production image)
FROM node:20-alpine AS runner
# Install openssl so libssl is available for the Prisma query engine at runtime
RUN apk add --no-cache openssl
WORKDIR /app

ENV NODE_ENV=production

EXPOSE 3000

# Create nextjs system user/group to run the application securely
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set ownership of the workdir to nextjs user while it is still empty
RUN chown nextjs:nodejs /app

USER nextjs

# Copy Next.js build output, public files, prisma files and package configuration (owned by nextjs)
COPY --chown=nextjs:nodejs --from=builder /app/package.json ./package.json
COPY --chown=nextjs:nodejs --from=builder /app/package-lock.json ./package-lock.json
COPY --chown=nextjs:nodejs --from=builder /app/public ./public
COPY --chown=nextjs:nodejs --from=builder /app/prisma ./prisma
COPY --chown=nextjs:nodejs --from=builder /app/.next ./.next

# Install production dependencies only as nextjs user, bypassing postinstall scripts
RUN npm ci --omit=dev --ignore-scripts

# Copy pre-generated Prisma Client from builder to ensure correct schema types are available
COPY --chown=nextjs:nodejs --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --chown=nextjs:nodejs --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "run", "start"]
