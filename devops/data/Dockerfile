FROM nginx:alpine

ENV TZ=Asia/Shanghai
RUN apk add tzdata --no-cache && ln -sf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN sed -i 's/^#gzip  on;/gzip  on;/g' /etc/nginx/nginx.conf

COPY conf.d/ /etc/nginx/conf.d/

EXPOSE 80
