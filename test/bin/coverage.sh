#!/usr/bin/env bash

source $(dirname $0)/_head.sh

### Merge Coverage results ###

COVERAGE_PATH=${__SCRIPT_PATH}"/../coverage"

istanbul-combine -d ${COVERAGE_PATH} -r lcov -p none \
  ${__SRC_PATH}/*/coverage/*.json

### Upload Coverage info to Codacy ###

cat ${COVERAGE_PATH}"/lcov.info" | codacy-coverage

### Cleanup! ###

__CMD='rm -rf ./coverage'

subpath_run_cmd ${__SRC_PATH} "$__CMD"
