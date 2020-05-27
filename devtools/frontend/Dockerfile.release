FROM frontend:builder as builder

FROM nginx:1.17-alpine

ENV TZ=Asia/Shanghai
RUN apk add tzdata --no-cache && ln -sf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /app

# 复制 nginx 配置
COPY ./devtools/docker.conf /etc/nginx/conf.d/docker.conf
# 复制 静态界面
COPY --from=builder /app/dist/ .

EXPOSE 80