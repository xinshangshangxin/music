#!/usr/bin/env bash

function getAllDeployments() {
  echo $(curl -s --request GET \
   --url https://api.zeit.co/now/deployments \
   --header "authorization: Bearer ${nowToken}" \
   | jq ".deployments | sort_by(.created) | reverse")
}

function getDeployments() {
  echo $(curl -s --request GET \
   --url https://api.zeit.co/now/deployments \
   --header "authorization: Bearer ${nowToken}" \
   | jq "[.deployments[] | select(.name | contains(\"${projectName}\"))]  | sort_by(.created) | reverse")
}

function deleteOldVersion() {
  local deployments=$(getDeployments)
  local maintainUid=$( echo ${deployments} | jq '[.[] | select(.state == "READY" | "FROZEN")] | first | .uid' )

  local deleteUidList=$( echo $( echo ${deployments} | jq ".[] | select(.uid != ${maintainUid}) | .uid" ) )

  echo "deleteUidList: ${deleteUidList}"

  declare -a arr=(${deleteUidList})

  for word in ${arr[@]}
  do
      echo ${word} | gsed -E "s/\"(.*)\"/\1/gi" | xargs -I {} curl -s --request DELETE --url https://api.zeit.co/now/deployments/{} --header "authorization: Bearer ${nowToken}"
      echo ""
  done
}


function build() {
  local nodeEnv=${1:-now}

  local envDockerDir=${projectDir}/${DockerfilePath}/${nodeEnv}
  resetDir
  baseBuild ${nodeEnv} ${envDockerDir} ${buildDir}
}

function deploy() {
  resetDir
  cd dist
  echo "now -t ${nowToken} -n ${projectName} --public ${nowAppend}"
  now -t ${nowToken} -n ${projectName} --public -C ${nowAppend}
}

function logs() {
  local deployments=$(getDeployments)
  local firstUid=$( echo ${deployments} | jq -r '. | first | .url' )

  local logsConfig="${firstUid} -f"
  local isNu=$(isNumber $1)

  if [ -n "$1" ] && [ ${isNu:-0} -eq 1 ]
  then
    logsConfig="${logsConfig} -n $1"
  else
    logsConfig="${logsConfig} $*"
  fi

  echo "now -t ${nowToken} logs ${logsConfig}"
  now -t ${nowToken} logs ${logsConfig}
}

function getFirstDeployment() {
  local name=${1}
  echo $(curl -s --request GET \
   --url https://api.zeit.co/now/deployments \
   --header "authorization: Bearer ${nowToken}" \
   | jq -r "[.deployments[] | select(.name | contains(\"${name}\"))]  | sort_by(.created) | reverse | first | .uid")
}

function alias() {
  local name=${1-${projectName}}
  local uid=$( getFirstDeployment ${projectName} )

  echo "uid: "${uid}
  echo "name: "${name}

  curl -s --request POST \
   --url https://api.zeit.co/now/deployments/${uid}/aliases \
   --header "authorization: Bearer ${nowToken}" \
   --data "{\"alias\": \"${projectName}.now.sh\"}" \
   | jq -r "."
}

function getProjectAlias() {
  curl -s --request GET \
   --url https://api.zeit.co/now/aliases \
   --header "authorization: Bearer ${nowToken}" \
   | jq -r ".aliases | sort_by(.created) | reverse | [ .[] | select(.alias | contains(\"${projectName}\")) ] | first";
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
    d)
    shift 1
    deleteOldVersion
    source build.sh now $*
    deploy
    alias
    getProjectAlias
    shift $#
    ;;
    build)
    shift 1
    source build.sh now $*
    shift $#
    ;;
    logs)
    shift 1
    logs $*
    shift $#
    ;;
    rm)
    shift 1
    deleteOldVersion
    shift $#
    ;;
    ls)
    shift 1
    echo $( getAllDeployments ) | jq
    shift $#
    ;;
    ln)
    shift 1
    alias
    getProjectAlias
    shift $#
    ;;
    deploy)
    shift 1
    deploy
    shift $#
    ;;
    noConflict)
    shift 1
    echo "now -t ${nowToken} $*"
    now -t ${nowToken} $*
    shift $#
    ;;
    *)
    echo ${key}
    shift
    ;;
esac
done

