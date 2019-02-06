#!/usr/bin/env bash

source util.sh

function baseBuild() {
  local nodeEnv=${1:-development}

  gulp build:dist
  echo "copy package.json"

  cat package.json | jq ".scripts.start=\"NODE_ENV=${nodeEnv} pm2-docker start .\/index.js --raw\" | .devDependencies={}" > ${buildDir}/package.json

  _generateLog
  _dockerConfig ${nodeEnv} ${projectDir}/${DockerfilePath}/${nodeEnv}
}

if [ "$1" = "prod" ]
then
  shift 1
  set -- "production $*"
fi


echo "===== build $* ====="
resetDir
baseBuild $*