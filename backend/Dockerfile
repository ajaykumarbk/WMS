# ---- Build ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install --production   # ← CHANGED: Use install + production

COPY . ./

# ---- Runtime ----
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app ./
EXPOSE 5000
ENV NODE_ENV=production
CMD ["node", "src/index.js"]