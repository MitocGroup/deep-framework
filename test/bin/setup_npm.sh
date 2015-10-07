#!/usr/bin/env bash

source $(dirname $0)/_head.sh

### Setting up NPM registry ###

NPMRC_FILE="$__RES_PATH/.npmrc"
cp ${NPMRC_FILE} $HOME/