#!/usr/bin/env bash
set -e

RELEASE_IMAGE_ALI=${ALI_CONTAINER_HOST}/${ALI_CONTAINER_NAMESPACE}/nginx:latest

# 登录阿里镜像
docker login -u "${ALI_CONTAINER_USER_NAME}" -p "${ALI_CONTAINER_PASSWORD}" "${ALI_CONTAINER_HOST}"

# 复制文件
mkdir -p nginx/
cp -r devtools/nginx/ nginx/devtools/
# 进入目录
cd nginx

# 拉取 release 镜像
docker pull ${RELEASE_IMAGE_ALI} || true
# 构建 release 镜像
docker build --cache-from ${RELEASE_IMAGE_ALI} --tag=${RELEASE_IMAGE_ALI} --file=./devtools/Dockerfile.release .

# 推送到远端
docker push ${RELEASE_IMAGE_ALI}

