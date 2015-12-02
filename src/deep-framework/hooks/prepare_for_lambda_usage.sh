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

# scripts directory is useless in a lambda
rm -rf "${path}"/../scripts

# aws-sdk is loaded by default in lambdas
find "${path}"/.. -type d -name aws-sdk -print0 | xargs -0 rm -rf

# remove markdown files
find "${path}"/.. -type f -not -name "*.js" -a -not -name "*.sh" -a -not -name "*.json" -a -not -ipath */bin/* -print0 | xargs -0 rm -rf

### LEAVE IT THE LAST STEP!!! ###

# hook directory is useless in a lambda
rm -rf "${path}"/../hooks