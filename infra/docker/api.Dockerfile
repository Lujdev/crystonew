FROM node:22-alpine AS base
RUN apk add --no-cache python3 make g++ \
  && corepack enable
WORKDIR /repo
COPY package.json pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
RUN pnpm install --frozen-lockfile=false

FROM base AS build
COPY . .
RUN pnpm --filter @crystodolar/api build
RUN pnpm deploy --filter @crystodolar/api --prod --legacy /prod/api

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S crysto && adduser -S crysto -G crysto
COPY --from=build /repo/apps/api/dist ./dist
COPY --from=build /prod/api/node_modules ./node_modules
COPY --from=build /prod/api/package.json ./package.json
RUN mkdir -p /app/data /app/backups /app/logs && chown -R crysto:crysto /app
USER crysto
EXPOSE 3001
CMD ["node", "dist/main.js"]
