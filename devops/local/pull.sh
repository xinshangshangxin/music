#!/usr/bin/env bash


function pullSubtree() {
  local row=$1
  local prefix=$(echo ${row} | jq -c -r '.prefix')
  local url=$(echo ${row} | jq -c -r '.url')
  local branch=$(echo ${row} | jq -c -r '.branch')

  echo "git subtree pull --prefix=${prefix} ${url} ${branch}"
  git subtree pull --prefix=${prefix} ${url} ${branch}
}

function pull() {
  local env=${1:-index}

  resetDir

  local currentBranch=$(_currentBranch)
  local targetBranch=$(_getConfig "branch" "" "${configFilePath}")
  local remote=$(_getConfig "remote" "" "${configFilePath}")

  if [ "${currentBranch}" != "${targetBranch}" ]; then
    echo "branch not support"
    exit 1;
  fi

  if [ "${env}" = "index" ]; then
    echo "git pull ${remote} ${currentBranch}:${targetBranch}"
    git pull ${remote} ${currentBranch}:${targetBranch}
  elif [ "${env}" = "subtree" ]; then
    resetDir
    export -f pullSubtree
    cat ${configFilePath} | jq -c -r '.subtree[]' | parallel -j 1 pullSubtree '{}'
  fi
}


echo "===== pull $* ====="
resetDir
pull $*