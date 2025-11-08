# # ---- Build Vite ----
# FROM node:20-alpine AS builder
# WORKDIR /app

# COPY package*.json ./
# RUN npm install --production

# COPY . ./
# RUN npm run build

# # ---- Nginx ----
# FROM nginx:alpine
# COPY nginx.conf /etc/nginx/conf.d/default.conf
# COPY --from=builder /app/dist /usr/share/nginx/html
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]

# ---- Build Vite ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
# Install ALL deps (including vite) for build
RUN npm install

COPY . ./
RUN npm run build   # Now vite is available

# ---- Nginx (Production) ----
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]