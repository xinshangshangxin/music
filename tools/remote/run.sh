# 参数判断
while [[ $# -gt 0 ]]
do
key="$1"
case ${key} in
    -d)
    shift 1
    DEPLOY_DIR=$1
    shift 1
    ;;
    -i)
    shift 1
    IMAGE=$1
    shift 1
    ;;
    --nm)
    shift 1
    NMDB_URL=$1
    shift 1
    ;;
    *)
    echo ${key}
    shift
    ;;
esac
done

cd ${DEPLOY_DIR}

export IMAGE="${IMAGE}"
export NMDB_URL="${NMDB_URL}"

docker-compose pull
docker-compose up -d