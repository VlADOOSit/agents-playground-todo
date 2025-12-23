FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

ENV NODE_ENV=production
RUN npm ci --omit=dev

COPY src ./src

EXPOSE 3001

CMD ["npm", "run", "start"]
