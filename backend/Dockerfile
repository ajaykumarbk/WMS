# --- BUILD STAGE ---
FROM node:20-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

# --- RUN STAGE ---
FROM node:20-alpine

WORKDIR /app

COPY --from=build /app .

EXPOSE 5000

CMD ["node", "server.js"]
