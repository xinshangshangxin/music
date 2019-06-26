#!/usr/bin/env bash
set -e

# 先检查 依赖 jq
function _checkDependence() {
	if ! command -v ${1} > /dev/null 2>&1;then
    echo "no ${1} found, please use: \n brew install ${1}"
    exit 1;
	fi
}

_checkDependence jq

# 定义全局变量
scriptDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
projectDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd ../.. && pwd )"

defaultEnv="docker"

cd ${scriptDir}


# 载入公共函数
source constants.sh
source util.sh

# 参数判断
while [[ $# -gt 0 ]]
do
key="$1"
case ${key} in
    push)
    shift 1
    source push.sh $*
    shift $#
    ;;
    pull)
    shift 1
    source pull.sh $*
    shift $#
    ;;
    *)
    echo ${key}
    exit 1
    ;;
esac
done
