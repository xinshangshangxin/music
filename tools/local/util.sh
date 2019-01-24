#!/usr/bin/env bash
# 不依赖外部环境变量即可运行的方法

function resetDir() {
  cd ${projectDir}
}

function _currentBranch() {
  git rev-parse --abbrev-ref HEAD
}

function _generateLog() {
  local currentBranch=`git rev-parse --abbrev-ref HEAD`
	local currentHead=`git rev-parse HEAD`
	local pushDate=`date +%Y_%m_%d_%H_%M_%S`

	echo ${currentBranch}-${pushDate}-${currentHead} > ./dist/version.txt
}

function _initGit() {
  local remoteName=$1;
  local url=$2;

  # 获取remote url
  local remoteVerbose=`git remote -v | grep -E "${remoteName}\s+.+push)"`

  if [ -z "${remoteVerbose}" ]
  then
    if [ -z "${url}" ]
    then
      echo "no push url"

      exit 1
      kill -9 $$
    fi

    git init
    echo "git remote add ${remoteName} ${url}"
    git remote add ${remoteName} ${url}
  fi
}

function _checkDependence() {
	if ! command -v ${1} > /dev/null 2>&1;then
    echo "no ${1} found, please use: \nbrew install ${1}"
    exit 1;
	fi
}

function _getConfig() {
  local configName=${1}
  local configDefaultValue=${2-""}
  local configFilePath=${3}

  if [ -z "${configName}" ]
  then
    echo "no config name found";
    # 退出不再执行
    kill -9 $$
    exit 1
  fi

  if [ ! -f "${configFilePath}" ]
  then
    echo "${configFilePath} not found";
    # 退出不再执行
    kill -9 $$
    exit 1
  fi


  local value=`cat ${configFilePath} | jq -r ".${configName}"`;
  if [ -z "${value}" -o ${value} = "null" ]
  then
    local value=${2}
  fi

  echo ${value};
}

function _dockerConfig() {
  local nodeEnv=${1}
  local envDockerDir=${2}

  if [ -d ${envDockerDir} ]
  then
    cp ${envDockerDir}/* ./dist
  else
    echo "no ${nodeEnv} Dockerfile dir, skip"
  fi
}

function _getPushInfo() {
  local configFilePath=${1}
  local projectDir=${2}
  local env=${3:-dev}

  local pushUrl=$(_getConfig "${env}.url" "" "${configFilePath}")
  local pushRemote=$(_getConfig "${env}.remote" "origin" "${configFilePath}")
  local currentBranch=$(_currentBranch)
  local pushBranch=$(_getConfig "${env}.branch" "" "${configFilePath}")

	if [ "${pushBranch}" = "__package_name__" ]
	then
	  pushBranch=$(_getConfig "name" "" "${projectDir}/package.json")
	elif [ -z "${pushBranch}" -o "${pushBranch}" = "null" ]
	then
	  pushBranch=${currentBranch}
	fi


	local my_list=(${pushUrl} ${pushRemote} ${currentBranch} ${pushBranch})
  echo "${my_list[@]}"
}

function exitAll() {
  kill -9 $$
}

function isNumber() {
  if [[ $1 =~ ^-?[0-9]+([.]{1}[0-9]+){0,1}$ ]]  ; then
    echo 1
  else
    echo 0
  fi
}