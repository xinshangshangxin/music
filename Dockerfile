FROM node:lts-alpine as build

WORKDIR /app

RUN apk add git --no-cache

COPY package.json package.json
COPY yarn.lock yarn.lock
RUN yarnpkg

COPY . .

ENV NODE_ENV "docker"
RUN npm run docker-build


FROM keymetrics/pm2:latest-alpine

ENV TZ=Asia/Shanghai
RUN apk add tzdata --no-cache && ln -sf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /app

RUN apk add git --no-cache

COPY package.json package.json
RUN yarnpkg --prodcution

COPY --from=build /app/dist/ .

ENV NODE_ENV "docker"
ENV PORT=80

EXPOSE 80

CMD ["npm", "run", "docker-run"]