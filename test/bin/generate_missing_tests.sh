#!/usr/bin/env bash

source $(dirname $0)/_head.sh

### Install NPM deps ###

__CMD='babel-node '${__SCRIPT_PATH}'/helper/generate_missing_tests.js `pwd -P`'

subpath_run_cmd ${__SRC_PATH} "$__CMD"