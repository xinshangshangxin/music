#!/usr/bin/env bash
set -e

BUILDER_CONTAINER_IMAGE=${CONTAINER_IMAGE}-builder

# login gitlab
docker login -u ${CONTAINER_USER_NAME} -p ${CONTAINER_PASSWORD} ${CONTAINER_HOST}

# pull builder image
echo "docker pull ${BUILDER_CONTAINER_IMAGE}"
docker pull ${BUILDER_CONTAINER_IMAGE}

# build "builder image" with cache 
echo "docker build --cache-from ${BUILDER_CONTAINER_IMAGE} --tag=${BUILDER_CONTAINER_IMAGE}"
docker build --cache-from ${BUILDER_CONTAINER_IMAGE} --tag=${BUILDER_CONTAINER_IMAGE} --file=- . <<EOF

FROM node:lts-alpine as build

WORKDIR /app

COPY package.json package.json
COPY yarn.lock yarn.lock
RUN yarnpkg

COPY . .

ENV NODE_ENV "docker"
RUN npm run docker-build

EOF

# push "builder image"
echo "docker push ${BUILDER_CONTAINER_IMAGE}"
docker push ${BUILDER_CONTAINER_IMAGE}

# pull "CONTAINER_IMAGE"
echo "docker pull ${CONTAINER_IMAGE}"
docker pull ${CONTAINER_IMAGE}

# build "CONTAINER_IMAGE" with cache
echo "docker build --cache-from ${BUILDER_CONTAINER_IMAGE} --cache-from ${CONTAINER_IMAGE} --tag=${CONTAINER_IMAGE}"
docker build --cache-from ${BUILDER_CONTAINER_IMAGE} --cache-from ${CONTAINER_IMAGE} --tag=${CONTAINER_IMAGE} --file=- . <<EOF
FROM ${CONTAINER_IMAGE}-builder as build

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

EOF

# push "CONTAINER_IMAGE" to gitlab
echo "docker push ${CONTAINER_IMAGE}"
docker push ${CONTAINER_IMAGE}

# ali push
docker login -u ${ALI_CONTAINER_USER_NAME} -p ${ALI_CONTAINER_PASSWORD} ${ALI_CONTAINER_HOST}
docker tag ${CONTAINER_IMAGE} ${ALI_CONTAINER_IMAGE}
docker push ${ALI_CONTAINER_IMAGE}