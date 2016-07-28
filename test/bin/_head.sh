#!/usr/bin/env bash

#####################################
### Initializing global variables ###
#####################################
__SCRIPT_PATH=$(cd $(dirname $0); pwd -P)
__COVERAGE_PATH="${__SCRIPT_PATH}/../coverages/local/${TRAVIS_REPO_SLUG}/${TRAVIS_BRANCH}/summary-report"
__ROOT_PATH="${__SCRIPT_PATH}/../../"
__SRC_PATH="${__SCRIPT_PATH}/../../src/"

__UPPER_CASE_TRAVIS_BRANCH=`echo "$TRAVIS_BRANCH" | tr '[:lower:]' '[:upper:]'`
__CODECLIMATE_TOKEN_NAME="CODECLIMATE_REPO_TOKEN_${__UPPER_CASE_TRAVIS_BRANCH}"

#######################################################################################
### Executes frontend/backend commands for subpaths with/without parallelizing mode ###
### Arguments:                                                                      ###
###   DIR                                                                           ###
###   CMD                                                                           ###
###   EXPR                                                                          ###
### Returns:                                                                        ###
###   None                                                                          ###
#######################################################################################
subpath_run_cmd () {
  local DIR
  local CMD
  local EXPR
  local EXIT_CODE=0

  DIR=$(cd $1 && pwd -P)
  CMD=$2

  if [ -z $3 ]; then
    EXPR="*"
    i=0;
    for subpath in $DIR/$EXPR
    do
      __MODULES[i]=$subpath
      i=$((i+1))
    done

  else
    EXPR=(${3//,/ })

    for i in "${!EXPR[@]}"
    do
      __MODULES[i]=$DIR/${EXPR[i]}
    done
  fi

  for subpath in "${__MODULES[@]}"
  do
    if [ -d ${subpath} ]; then
      cd ${subpath} && eval_or_exit "$CMD"
      EXIT_CODE=$((EXIT_CODE+$?))
    fi
  done

  exit $EXIT_CODE
}

#############################################################
### Executes command if fails try again and shows results ###
### Arguments:                                            ###
###   CMD                                                 ###
### Returns:                                              ###
###   0 or 1                                              ###
#############################################################
function eval_or_exit() {
  eval "$1"

  local RET_CODE=$?

  if [[ ${RET_CODE} != 0 ]]  &&  [[ $1 == "npm run test" ]]; then
    #Run DEBUG_TEST_CMD command to show error in log
    echo "[FAILED] $1 -> try to re-run to show error in debug mode"
    local DEBUG_TEST_CMD="babel-node `which _mocha` --ui tdd --recursive --reporter spec"
    eval_or_exit "$DEBUG_TEST_CMD"
  elif [ ${RET_CODE} != 0 ]; then
    echo "[FAILED] $1"
    return 1
  else
    echo "[SUCCEED] $1"
  fi
}

#############################################################################
### Checks if all environment variables available for validating coverage ###
### Arguments:                                                            ###
###   None                                                                ###
### Returns:                                                              ###
###   0 or 1                                                              ###
#############################################################################
IS_ENV_VARS_AVAILABLE () {
  if [ -z $GITHUB_OAUTH_TOKEN ] || [ -z $AWS_ACCESS_KEY_ID ] || [ -z AWS_SECRET_ACCESS_KEY ] || \
    [ -z $S3_BUCKET_NAME ] || [ -z $AWS_DEFAULT_REGION ]; then
    echo 0;

    return;
  fi

  echo 1;
}

#################################################################
### Checks if codeclimate token available for specific branch ###
### Arguments:                                                ###
###   None                                                    ###
### Returns:                                                  ###
###   0 or 1                                                  ###
#################################################################
IS_CODECLIMATE_TOKEN_AVAILABLE () {

  if [ -z `printenv $__CODECLIMATE_TOKEN_NAME` ]; then
    echo 0;

    return;
  fi

  echo 1;
}