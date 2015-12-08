#!/usr/bin/env bash

source $(dirname $0)/_head.sh

### Merge Coverage results ###

COVERAGE_PATH=${__SCRIPT_PATH}"/../coverage"

istanbul-combine -d ${COVERAGE_PATH} -r lcov -p both \
  ${__SRC_PATH}/*/coverage/*.json

### Replacing 'lib.compiled' to 'lib' ###
cd ${COVERAGE_PATH}
SEARCH_VALUE="lib.compiled"
REPLACE_VALUE="lib"
export PATH_TO_TEST_TDF_FILE="$(find . -name lcov.info)"
sed "s/${SEARCH_VALUE}/${REPLACE_VALUE}/g" "${PATH_TO_TEST_TDF_FILE}" > ${COVERAGE_PATH}/report.info

### Upload Coverage info to Codacy ###

cat ${COVERAGE_PATH}"/report.info" | codacy-coverage

### Cleanup! ###

__CMD='rm -rf ./coverage'

subpath_run_cmd ${__SRC_PATH} "$__CMD"
