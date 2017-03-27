#!/usr/bin/env bash

source $(dirname $0)/_head.sh

### Install NPM deps ###

deepify compile es6 ${__SCRIPT_PATH}/helper

__CMD='node '${__SCRIPT_PATH}'/helper/generate_missing_tests.js `pwd -P`'

subpath_run_cmd ${__SRC_PATH} "$__CMD"