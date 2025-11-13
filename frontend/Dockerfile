FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine

ENV PORT=8080

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Replace ${PORT} in nginx.conf using envsubst
RUN apk add --no-cache gettext \
    && envsubst '$PORT' < /etc/nginx/conf.d/default.conf > /etc/nginx/conf.d/default.conf.tmp \
    && mv /etc/nginx/conf.d/default.conf.tmp /etc/nginx/conf.d/default.conf

# Copy built app
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
