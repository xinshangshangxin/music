#!/usr/bin/env bash

function push() {
  local env=${1:-dev}
  local nodeEnv=${2:-${defaultEnv}}

  resetDir
  if [ ${env} = "prod" ]
  then
    cd ${buildDir}
  fi

  local pushInfo=( $(_getPushInfo ${projectDir}/${defaultConfigPath} ${projectDir} ${env}) )

  local pushUrl=${pushInfo[0]}
  local pushRemote=${pushInfo[1]}
  local currentBranch=${pushInfo[2]}
  local pushBranch=${pushInfo[3]}

  if [ -z "${pushUrl}" -o -z "${pushRemote}" -o -z "${currentBranch}" -o -z "${pushBranch}" ]
  then
    echo "${env} config not correct: ${pushInfo[*]}"
    kill -9 $$
    exit 1
  fi

  _initGit ${pushRemote} ${pushUrl}

  if [ ${env} = "prod" ]
  then
    resetDir
    cd ${buildDir}
    echo "run cmd at $(pwd)"
    now=`date +%Y_%m_%d_%H_%M_%S`
    git add -A
    git commit -m "${now}" || echo ""
    echo "git push ${pushRemote} ${currentBranch}:${pushBranch}(${nodeEnv}) -f"
	  git push ${pushRemote} ${currentBranch}:${pushBranch}\(${nodeEnv}\) -f
  else
    echo "run cmd at $(pwd)"
    echo "git push ${pushRemote} ${currentBranch}:${pushBranch}"
	  git push ${pushRemote} ${currentBranch}:${pushBranch}
	fi
}


if [ "$1" != "" -a "$1" != "development" ]
then
  cd ${scriptDir}
  source build.sh $*
fi

echo "===== push $* ====="
resetDir
push $*