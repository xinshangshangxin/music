#!/usr/bin/env bash
function build() {
  local nodeEnv=${1:-leancloud}

  resetDir

  mkdir -p ${buildDir}/.leancloud
  local appId=$( cat ${projectDir}/src/config/${nodeEnv}.json5 | grep -E "appId" | sed -e "s/ *appId[ \"']*:[ \"']*//g" -e "s/[\"',]*//g" )
  echo "${appId}" > ${buildDir}/.leancloud/current_app_id
  echo "web" > ${buildDir}/.leancloud/current_group

  cat ${buildDir}/package.json | jq ".engines.node=\">10\" | .devDependencies={} | .dependencies.pm2=\"^3.2.3\"" > ${buildDir}/__package__.json
  mv ${buildDir}/__package__.json ${buildDir}/package.json
}

function deploy() {
  resetDir

  cd ${buildDir} && lean deploy
}


# 如果没有参数, 就是deploy
if [ -z "$*" ]
then
  set -- "deploy"
fi


# 参数判断
while [[ $# -gt 0 ]]
do
key="$1"
case ${key} in
    build)
    shift 1
    source build.sh leancloud $*
    build leancloud
    shift $#
    ;;
    deploy)
    shift 1

    source build.sh leancloud $*
    build leancloud

    deploy
    
    shift $#
    ;;
    *)
    echo ${key}
    shift
    ;;
esac
done
