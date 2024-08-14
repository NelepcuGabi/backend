FROM node:slim
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 9900
CMD ["node", "index.js"]