FROM node:18-alpine

WORKDIR /app

RUN npm install --production

COPY . .

ENV PORT=5000

EXPOSE 5000

CMD ["npm", "start"]
