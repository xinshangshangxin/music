#!/usr/bin/env bash
set -e

BUILDER_CONTAINER_IMAGE=${CONTAINER_HOST}/${CI_PROJECT_PATH}/${CI_PROJECT_NAME}:builder
LATEST_CONTAINER_IMAGE=${CONTAINER_HOST}/${CI_PROJECT_PATH}/${CI_PROJECT_NAME}:latest

# login gitlab
docker login -u ${CONTAINER_USER_NAME} -p ${CONTAINER_PASSWORD} ${CONTAINER_HOST}

# pull builder image
echo "docker pull ${BUILDER_CONTAINER_IMAGE}"
docker pull ${BUILDER_CONTAINER_IMAGE} || true

# build "builder image" with cache
echo "docker build --cache-from ${BUILDER_CONTAINER_IMAGE} --tag=${BUILDER_CONTAINER_IMAGE}"
docker build --cache-from ${BUILDER_CONTAINER_IMAGE} --tag=${BUILDER_CONTAINER_IMAGE} --file=- . <<EOF

FROM node:10-alpine as build

WORKDIR /app

RUN apk add git --no-cache

COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm i --prodcution=false

COPY . .

ENV NODE_ENV "docker"
RUN npm run build:docker

EOF

# push "builder image"
echo "docker push ${BUILDER_CONTAINER_IMAGE}"
docker push ${BUILDER_CONTAINER_IMAGE}

# pull "LATEST_CONTAINER_IMAGE"
echo "docker pull ${LATEST_CONTAINER_IMAGE}"
docker pull ${LATEST_CONTAINER_IMAGE} || true

# build "LATEST_CONTAINER_IMAGE" with cache
echo "docker build --cache-from ${LATEST_CONTAINER_IMAGE} --tag=${LATEST_CONTAINER_IMAGE}"
docker build --cache-from ${LATEST_CONTAINER_IMAGE} --tag=${LATEST_CONTAINER_IMAGE} --file=- . <<EOF
FROM ${BUILDER_CONTAINER_IMAGE} as build

FROM nginx:alpine

ENV TZ=Asia/Shanghai
RUN apk add tzdata --no-cache && ln -sf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /app
# 复制 静态界面
COPY --from=build /app/dist/ .
# 复制 nginx 配置
COPY data/conf.d/ /etc/nginx/conf.d/

EXPOSE 80

EOF

# push "LATEST_CONTAINER_IMAGE" to gitlab
echo "docker push ${LATEST_CONTAINER_IMAGE}"
docker push ${LATEST_CONTAINER_IMAGE}

# ali push
docker login -u ${ALI_CONTAINER_USER_NAME} -p ${ALI_CONTAINER_PASSWORD} ${ALI_CONTAINER_HOST}
docker tag ${LATEST_CONTAINER_IMAGE} ${ALI_CONTAINER_IMAGE}

echo "docker push ${ALI_CONTAINER_IMAGE}"
docker push ${ALI_CONTAINER_IMAGE}
