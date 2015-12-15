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

echo "Removing shell scripts due to uselessness"
find "${path}"/.. -type f -iname "*.sh" -print0 | xargs -0 rm -rf

echo "Removing aws-sdk recursively"
find "${path}"/.. -type d -iname "aws-sdk*" -print0 | xargs -0 rm -rf

echo "Removing grunt configuration files recursively"
find "${path}"/.. -type f -iname "gruntfile.js" -print0 | xargs -0 rm -rf

echo "Removing hooks directory due to uselessness"
rm -rf "${path}"/../hooks