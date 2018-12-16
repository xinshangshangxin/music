#!/usr/bin/env bash
function build() {
  local nodeEnv=${1:-leancloud}

  resetDir

  mkdir -p ${buildDir}/.leancloud
  local appId=$( cat ${projectDir}/src/config/${nodeEnv}.json5 | grep -E "appId" | sed -e "s/ *appId[ \"']*:[ \"']*//g" -e "s/[\"',]*//g" )
  echo "${appId}" > ${buildDir}/.leancloud/current_app_id
  echo "web" > ${buildDir}/.leancloud/current_group
}

function deploy() {
  cd ${buildDir} && lean deploy
}


# 如果没有参数, 就是deploy
if [ -z "$*" ]
then
  set -- "d"
fi


# 参数判断
while [[ $# -gt 0 ]]
do
key="$1"
case ${key} in
    build)
    shift 1
    # source build.sh leancloud $*
    build leancloud
    shift $#
    ;;
    deploy)
    shift 1
    deploy
    shift $#
    ;;
    *)
    echo ${key}
    shift
    ;;
esac
done
