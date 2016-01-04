#!/usr/bin/env bash

__SCRIPT_PATH=$(cd $(dirname $0); pwd -P)
__RES_PATH="${__SCRIPT_PATH}/../resources"

__ROOT_PATH="${__SCRIPT_PATH}/../../"
__SRC_PATH="${__ROOT_PATH}src/"

subpath_run_cmd () {
    local DIR
    local CMD
    local EXPR

    DIR=$(cd $1 && pwd -P)
    CMD=$2

    if [ -z $3 ]; then
        EXPR="*"
    else
        EXPR=$3
    fi

    for subpath in $DIR/$EXPR
    do
        if [ -d ${subpath} ]; then
            cd ${subpath} && eval_or_exit "$CMD"
        fi
    done
}

eval_or_exit() {
    local RET_CODE
    local COMMAND

    COMMAND="`which istanbul` cover _mocha -- --compilers js:babel/register --reporter spec --ui tdd"

    eval "$1"
    RET_CODE=$?

    if [[ ${RET_CODE} != 0 ]]  &&  [[ $1 == "npm run test" ]]; then

        #Run test-debug to show error
        subpath_run_cmd ${__SRC_PATH} ${COMMAND}
        echo "[FAILED] $1, try to re-run to show error in debug mode"

    elif [ ${RET_CODE} != 0 ]; then
        echo "[FAILED] $1"
        exit 1
    else
        echo "[SUCCEED] $1"
    fi
}