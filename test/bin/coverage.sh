#!/usr/bin/env bash

source $(dirname $0)/_head.sh

### Merge Coverage results ###

COVERAGE_PATH=${__SCRIPT_PATH}"/../coverage"

istanbul-combine -d ${COVERAGE_PATH} -r lcov -p both \
  ${__SRC_PATH}/*/coverage/*.json

SEARCH_VALUE="/compile"
REPLACE_VALUE=""

sed -e "s@${SEARCH_VALUE}@${REPLACE_VALUE}@g" ${COVERAGE_PATH}"/lcov.info" > ${COVERAGE_PATH}"/coverage.info"

### Upload Coverage info to Codacy ###

cat ${COVERAGE_PATH}"/coverage.info" | codacy-coverage --debug

### Cleanup! ###

__CMD='rm -rf ./coverage'

subpath_run_cmd ${__SRC_PATH} "$__CMD"
