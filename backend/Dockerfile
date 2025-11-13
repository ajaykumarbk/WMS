# # # # ---- Build ----
# # # FROM node:20-alpine AS builder
# # # WORKDIR /app

# # # COPY package*.json ./
# # # RUN npm install --production   # ← CHANGED: Use install + production

# # # COPY . ./

# # # # ---- Runtime ----
# # # FROM node:20-alpine
# # # WORKDIR /app
# # # COPY --from=builder /app ./
# # # EXPOSE 5000
# # # ENV NODE_ENV=production
# # # CMD ["node", "src/index.js"]

# # FROM node:18-alpine

# # WORKDIR /app

# # # Copy package files
# # COPY package*.json ./

# # # Install dependencies
# # RUN npm install --production

# # # Copy application code
# # COPY . .

# # # Create uploads directory
# # RUN mkdir -p uploads

# # # Expose port
# # EXPOSE 5000

# # # Start application
# # CMD ["node", "server.js"]

# FROM node:18-slim

# WORKDIR /app

# # Copy package files
# COPY package*.json ./

# # Install dependencies
# RUN npm ci --only=production

# # Copy application code
# COPY . .

# # Create uploads directory
# RUN mkdir -p uploads

# # Expose port 8080
# EXPOSE 8080

# # Health check
# HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
#   CMD node -e "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# CMD ["node", "server.js"]


# ---------------------------------------------------
# 1. Use official Node.js image
# ---------------------------------------------------
FROM node:18-alpine

# ---------------------------------------------------
# 2. Set working directory
# ---------------------------------------------------
WORKDIR /app

# ---------------------------------------------------
# 3. Copy package.json and package-lock.json first
#    (faster builds due to caching)
# ---------------------------------------------------
COPY package*.json ./

# ---------------------------------------------------
# 4. Install only production dependencies
# ---------------------------------------------------
RUN npm install --production

# ---------------------------------------------------
# 5. Copy entire backend source code
# ---------------------------------------------------
COPY . .

# ---------------------------------------------------
# 6. Cloud Run injects PORT automatically
# ---------------------------------------------------
ENV PORT=5000

# ---------------------------------------------------
# 7. Expose PORT (not required, but good practice)
# ---------------------------------------------------
EXPOSE 5000

# ---------------------------------------------------
# 8. Start backend server (server.js)
# ---------------------------------------------------
CMD ["npm", "start"]
