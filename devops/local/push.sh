#!/usr/bin/env bash


function pushSubtree() {
  local row=$1
  local prefix=$(echo ${row} | jq -c -r '.prefix')
  local url=$(echo ${row} | jq -c -r '.url')
  local branch=$(echo ${row} | jq -c -r '.branch')

  echo "git subtree push --prefix=${prefix} ${url} ${branch}"
  git subtree push --prefix=${prefix} ${url} ${branch}
}

function push() {
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
    echo "git push ${remote} ${currentBranch}:${targetBranch}"
    git push ${remote} ${currentBranch}:${targetBranch}
  elif [ "${env}" = "subtree" ]; then
    resetDir
    export -f pushSubtree
    cat ${configFilePath} | jq -c -r '.subtree[]' | parallel -j 1 pushSubtree '{}'
  fi
}


echo "===== push $* ====="
resetDir
push $*