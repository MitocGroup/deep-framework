#!/usr/bin/env bash

path=$(cd $(dirname $0); pwd -P)
npm=$(which npm)

assure_npm() {
    if [ -z ${npm} ]; then
        assure_brew

        echo "Installing nodejs..."
        ${brew} install nodejs

        npm=$(which npm)
    fi
}

assure_npm

# browser build is useless in a lambda
rm -rf "${path}"/../browser

# aws-sdk is loaded by default in lambdas
find "${path}"/../ -name aws-sdk -print0 | xargs -0 rm -rf
