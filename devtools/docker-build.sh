#!/usr/bin/env bash
set -o errexit
set -o pipefail
set -o nounset

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "${script_dir}"

parallel -j 3 --ungroup ::: "bash ${script_dir}/frontend/docker-build.sh" "bash ${script_dir}/backend/docker-build.sh" "bash ${script_dir}/nginx/docker-build.sh"
