#!/usr/bin/env bash

source util.sh

function baseBuild() {
  local nodeEnv=${1:-development}

  rm -rf dist
  mkdir dist
  mkdir dist/graphqls
  cp src/graphqls/*.graphql dist/graphqls/

  mkdir dist/config
  cp src/config/${nodeEnv}.js dist/config/
  tsc
  
  echo "copy package.json"

  cat package.json | jq ".scripts={} | .scripts.start=\"NODE_ENV=${nodeEnv} pm2-docker start .\/index.js -i 1 --raw\" | .devDependencies={}" > ${buildDir}/package.json

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