FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build orders-service

CMD ["node", "dist/apps/orders-service/main.js"]
