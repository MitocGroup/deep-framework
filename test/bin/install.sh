#!/usr/bin/env bash

source $(dirname $0)/_head.sh

### Install NPM deps ###

__CMD='npm install --save --save-dev --save-optional --save-exact --no-bin-links'

subpath_run_cmd ${__SRC_PATH} "$__CMD"