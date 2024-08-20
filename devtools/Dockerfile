# pm2
FROM node:22-alpine AS pm2

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

ENV TZ=Asia/Shanghai
ENV NODE_ENV=production
RUN npm install pm2 -g && \
  apk add alpine-conf && \
  /sbin/setup-timezone -z Asia/Shanghai && \
  apk del alpine-conf

WORKDIR /app


# nginx
FROM nginx:1.25.1-alpine AS nginx
ENV TZ=Asia/Shanghai
ENV NODE_ENV=production
RUN apk add alpine-conf && \
  /sbin/setup-timezone -z Asia/Shanghai && \
  apk del alpine-conf

RUN sed -i 's/^#gzip  on;/gzip  on;/g' /etc/nginx/nginx.conf



###################创建 构建容器, 用于编译所有代码#####################
FROM node:22-alpine AS builder
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY pnpm-lock.yaml ./
RUN pnpm fetch

COPY . .

# 前端构建 APP_NAME API_URL 等参数
RUN --mount=type=secret,id=PUBLIC_ENV \
  cat /run/secrets/PUBLIC_ENV >./.env.prod

RUN pnpm install --offline
RUN pnpm run build


############################ 创建 api 构建容器#######################
FROM builder AS api-builder
RUN pnpm -F api --prod deploy /deploy/api


############################## 接口容器 ########################
FROM pm2 AS api 
COPY --from=api-builder /deploy/api .
CMD ["pm2-runtime", "/app/dist/cjs/index.cjs"]


############################# 入口容器 ###########################
FROM nginx AS console 
COPY --from=builder /app/apps/console/dist/ /app
COPY devtools/default.conf /etc/nginx/conf.d/default.conf