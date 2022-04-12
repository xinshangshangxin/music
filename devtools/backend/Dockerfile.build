FROM node:12-alpine

WORKDIR /app

RUN apk add git --no-cache

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm ci

COPY . .

RUN npm run build