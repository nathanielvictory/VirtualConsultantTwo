FROM node:20

WORKDIR /app
COPY package*.json ./
RUN npm ci || npm i

COPY . .
EXPOSE 5173
CMD ["npm","run","dev","--","--host"]
