#!/usr/bin/env bash

source $(dirname $0)/_head.sh

##############################
### Merge Coverage Results ###
##############################
istanbul-combine -d ${__COVERAGE_PATH} -r lcovonly -p both \
  ${__SRC_PATH}/*/coverage/*.json

######################################
### Upload Coverage info to Codacy ###
######################################
cat ${__COVERAGE_PATH}"/lcov.info" | codacy-coverage --debug

#####################################################################
### Log top 20 file paths to be able see paths format from travis ###
#####################################################################
head -n 20 ${__COVERAGE_PATH}"/lcov.info"

#############################################
### Cleanup! Remove all generated reports ###
#############################################
__CMD='rm -rf ./coverage'
subpath_run_cmd ${__SRC_PATH} "$__CMD"

###########################
### Remove final report ###
###########################
cd ${__COVERAGE_PATH}
rm -rf ${__COVERAGE_PATH}
