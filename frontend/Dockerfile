FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine

# Set Cloud Run port variable
ENV PORT=8080

# Add envsubst to expand ${PORT}
RUN apk add --no-cache gettext

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expand ${PORT} in nginx.conf
RUN envsubst '$PORT' < /etc/nginx/conf.d/default.conf > /etc/nginx/conf.d/default.conf.tmp \
    && mv /etc/nginx/conf.d/default.conf.tmp /etc/nginx/conf.d/default.conf

# Copy built frontend
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
