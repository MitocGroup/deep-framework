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

echo "Removing browser build due to uselessness"
rm -rf "${path}"/../browser

echo "Removing script directory due to uselessness"
rm -rf "${path}"/../scripts

echo "Removing garbage (!*.{js,json} && !*/bin/*)"
find "${path}"/.. -type f -not -iname "*.js" -a -not -iname "*.json" -a -not -iname "*.sh" -a -not -ipath */bin/* -print0 | xargs -0 rm -rf

echo "Removing README files"
find "${path}"/.. -type f -iname README | xargs -0 rm -rf

echo "Removing tests recursively"
find "${path}"/.. -type d -iname "test*" -print0 | xargs -0 rm -rf
find "${path}"/.. -type f -iname "test*.js" -print0 | xargs -0 rm -rf

echo "Removing empty files and directories"
find "${path}"/.. -empty -print0 | xargs -0 rm -rf
