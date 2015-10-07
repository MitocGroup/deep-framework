#!/usr/bin/env bash

source $(dirname $0)/_head.sh
jscs=`which jscs`

if [ -z ${jscs} ]; then
    assure_npm

    ${npm} -g install jscs
fi

if [ -f ${path}/../.git/hooks/pre-commit ]; then
    cp ${path}/../.git/hooks/pre-commit ${path}/../.git/hooks/pre-commit_$(date +%F-%H%M%S).bak
fi

cp ${path}/pre-commit ${path}/../.git/hooks/.
