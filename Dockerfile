FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

# Install all dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/
RUN pnpm install --frozen-lockfile

# Build frontend + backend
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG VITE_BASE_PATH=/
ENV VITE_BASE_PATH=${VITE_BASE_PATH}
RUN pnpm exec vite build && \
    pnpm exec esbuild server/_core/index.ts \
    --platform=node --packages=external --bundle --format=esm --outdir=dist \
    '--define:process.env.NODE_ENV="production"' && \
    mkdir -p dist/sales && \
    cp -f index.html styles.css script.js dist/sales/ 2>/dev/null; \
    cp -f plataforma.html plataforma.css plataforma.js dist/sales/ 2>/dev/null; \
    cp -f login.html auth.css auth.js dist/sales/ 2>/dev/null; \
    cp -f checkout.html cadastro.html ativar.html dist/sales/ 2>/dev/null; \
    true

# Production dependencies only
FROM base AS prod-deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/
RUN pnpm install --frozen-lockfile --prod

# Final image
FROM node:20-alpine
WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["node", "dist/index.js"]
