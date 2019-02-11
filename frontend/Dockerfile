FROM node:lts-alpine as build

WORKDIR /app

COPY package.json package.json
COPY yarn.lock yarn.lock
RUN yarnpkg

COPY . .

ENV NODE_ENV "docker"
RUN npm run build:docker


FROM nginx:alpine

ENV TZ=Asia/Shanghai
RUN apk add tzdata --no-cache && ln -sf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /app
# 复制 静态界面
COPY --from=build /app/dist/ .
# 复制 nginx 配置
COPY data/conf.d/ /etc/nginx/conf.d/

EXPOSE 80
