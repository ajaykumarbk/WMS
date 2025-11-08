# ---- Build ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./

# ---- Runtime ----
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app ./
EXPOSE 5000
ENV NODE_ENV=production
CMD ["node", "src/index.js"]   # adjust if entry point is different