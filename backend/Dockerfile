# # ---- Build ----
# FROM node:20-alpine AS builder
# WORKDIR /app

# COPY package*.json ./
# RUN npm install --production   # ← CHANGED: Use install + production

# COPY . ./

# # ---- Runtime ----
# FROM node:20-alpine
# WORKDIR /app
# COPY --from=builder /app ./
# EXPOSE 5000
# ENV NODE_ENV=production
# CMD ["node", "src/index.js"]

FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 5000

# Start application
CMD ["node", "server.js"]