#!/usr/bin/env bash

source $(dirname $0)/_head.sh

### Install NPM deps ###

__CMD='npm install'

subpath_run_cmd ${__SRC_PATH} "$__CMD"