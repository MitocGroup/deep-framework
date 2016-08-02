#!/usr/bin/env bash
#
# Created by vcernomschi on 10/06/2015
#

path=$(cd $(dirname $0); pwd -P)
npm=`which npm`
eslint=`which eslint`

if [ -z ${eslint} ]; then
    ${npm} -g install eslint
fi

if [ -f ${path}/../.git/hooks/pre-commit ]; then
    cp ${path}/../.git/hooks/pre-commit ${path}/../.git/hooks/pre-commit_$(date +%F-%H%M%S).bak
fi

cp ${path}/pre-commit ${path}/../.git/hooks/.
