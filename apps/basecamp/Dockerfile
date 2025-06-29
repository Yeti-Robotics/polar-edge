FROM node:22-alpine AS base

FROM base AS builder
RUN apk add --no-cache libc6-compat
RUN apk update
# Set working directory
WORKDIR /usr/src/app
RUN npm i -g turbo
COPY . .

RUN turbo prune basecamp --docker

FROM base AS installer
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/out/json/ .
COPY --from=builder /usr/src/app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN corepack enable
RUN pnpm install --frozen-lockfile

COPY --from=builder /usr/src/app/out/full/ .
RUN pnpm dlx turbo run build --filter=basecamp

FROM base AS runner
WORKDIR /usr/src/app

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy the built application and node_modules
COPY --from=installer --chown=nestjs:nodejs /usr/src/app/apps/basecamp/dist ./dist
COPY --from=installer --chown=nestjs:nodejs /usr/src/app/node_modules ./node_modules

USER nestjs

CMD ["node", "dist/main"]
