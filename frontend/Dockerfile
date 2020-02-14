FROM node:12-alpine as build

WORKDIR /app

COPY package.json package.json
COPY package-lick.json package-lick.json

RUN npm ci

COPY . .

RUN npm run build



FROM nginx:1.17-alpine

ENV TZ=Asia/Shanghai
RUN apk add tzdata --no-cache && ln -sf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /app

# 复制 静态界面
COPY --from=build /app/dist/ .
# 复制 nginx 配置
COPY ../devtools/frontend/conf.d/ /etc/nginx/conf.d/

EXPOSE 80





