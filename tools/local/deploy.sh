#!/usr/bin/env bash
set -e

mkdir deploy

ls -la tools/data/

cp tools/remote/run.sh deploy/run.sh
cp tools/data/docker-compose.yml deploy/docker-compose.yml

ls -la ./deploy

# sync files to server
sshpass -p ${DEPLOY_PASSWORD} rsync --exclude node_modules --exclude .git --delete -avzP -e "ssh -o StrictHostKeyChecking=no -p ${DEPLOY_PORT:-22}" ./deploy/ ${DEPLOY_NAME:-deploy}@${DEPLOY_HOST}:${DEPLOY_DIR}

# run on server
sshpass -p ${DEPLOY_PASSWORD} ssh -o StrictHostKeyChecking=no -p ${DEPLOY_PORT:-22} ${DEPLOY_NAME:-deploy}@${DEPLOY_HOST} "bash ${DEPLOY_DIR}/run.sh -d ${DEPLOY_DIR} -i ${ALI_CONTAINER_IMAGE} --nm \"${NMDB_URL}\""

    