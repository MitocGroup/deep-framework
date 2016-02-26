#!/usr/bin/env bash

source $(dirname $0)/_head.sh

### Find package.json files and replace main path from lib.compiled to lib###
perl -pi -w -e 's/lib.compiled/lib/g' ${__ROOT_PATH}src/*/package.json


### Find .npmignore files and replace /lib to empty string###
perl -pi -w -e 's/\/lib//g' ${__ROOT_PATH}src/*/.npmignore