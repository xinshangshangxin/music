#!/usr/bin/env bash
set -e

RELEASE_IMAGE_ALI=${ALI_CONTAINER_HOST}/${ALI_CONTAINER_NAMESPACE}/frontend:latest
BUILD_IMAGE_ALI=${ALI_CONTAINER_HOST}/${ALI_CONTAINER_NAMESPACE}/frontend:builder

# 登录阿里镜像
docker login -u "${ALI_CONTAINER_USER_NAME}" -p "${ALI_CONTAINER_PASSWORD}" "${ALI_CONTAINER_HOST}"

# 复制文件
cp -r devtools/frontend/ frontend/devtools/
# 进入目录
cd frontend

# 拉取 builder 镜像
docker pull ${BUILD_IMAGE_ALI} || true
# 构建 builder 镜像
docker build --cache-from ${BUILD_IMAGE_ALI} --tag=frontend:builder --file=./devtools/Dockerfile.build .
# 重命名 构建 镜像
docker tag frontend:builder ${BUILD_IMAGE_ALI}
# 推送到远端
docker push ${BUILD_IMAGE_ALI}


# 拉取 release 镜像
docker pull ${RELEASE_IMAGE_ALI} || true
# 构建 release 镜像
docker build --cache-from ${RELEASE_IMAGE_ALI} --tag=${RELEASE_IMAGE_ALI} --file=./devtools/Dockerfile.release .

# 推送到远端
docker push ${RELEASE_IMAGE_ALI}

