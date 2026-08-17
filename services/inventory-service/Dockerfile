# --- Stage 1: install dependencies ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY src/ ./src/

# --- Stage 2: lightweight runtime image ---
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4001
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY package*.json ./
EXPOSE 4001
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://localhost:4001/health || exit 1
USER node
CMD ["node", "src/index.js"]
