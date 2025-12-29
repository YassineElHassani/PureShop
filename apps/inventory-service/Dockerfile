FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build inventory-service

CMD ["node", "dist/apps/inventory-service/main.js"]
