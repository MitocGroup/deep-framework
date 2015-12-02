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

cd ${path}/../
rm -rf ./browser

# @todo: add other optimisations!