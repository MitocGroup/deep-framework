#!/usr/bin/env bash

path=$(cd $(dirname $0); pwd -P)
npm=$(which npm)

assure_npm() {
    if [ -z "${npm}" ]; then
        echo "You may install NPM first!"
    fi
}

assure_npm

echo "Removing shell scripts due to uselessness"
find "${path}"/../.. -type f -iname "*.sh" -print0 | xargs -0 rm -rf

echo "Removing aws-sdk recursively"
find "${path}"/../.. -type d -iname "aws-sdk*" -print0 | xargs -0 rm -rf

echo "Removing browser libs (e.g. lodash-compat)"
find "${path}"/../.. -type d -iname "lodash-compat*" -print0 | xargs -0 rm -rf

echo "Removing some configuration files recursively (gruntfile.js, jscs.json, etc.)"
find "${path}"/../.. -type f -iname "gruntfile.js" -print0 | xargs -0 rm -rf
find "${path}"/../.. -type f -iname ".jscs.json" -print0 | xargs -0 rm -rf
find "${path}"/../.. -type f -iname "jshint.json" -print0 | xargs -0 rm -rf
find "${path}"/../.. -type f -iname "component.json" -print0 | xargs -0 rm -rf
find "${path}"/../.. -type f -iname "bower.json" -print0 | xargs -0 rm -rf
find "${path}"/../.. -type f -iname ".hound.yml" -print0 | xargs -0 rm -rf
find "${path}"/../.. -type f -iname ".houndignore" -print0 | xargs -0 rm -rf
find "${path}"/../.. -type f -iname ".gitignore" -print0 | xargs -0 rm -rf
find "${path}"/../.. -type f -iname ".npmignore" -print0 | xargs -0 rm -rf
find "${path}"/../.. -type f -iname ".bithoundrc" -print0 | xargs -0 rm -rf
find "${path}"/../.. -type f -iname "esdoc.json" -print0 | xargs -0 rm -rf
find "${path}"/../.. -type f -iname ".jshintrc" -print0 | xargs -0 rm -rf
find "${path}"/../.. -type f -iname ".travis.yml" -print0 | xargs -0 rm -rf

# Removing some certain files
find "${path}"/../.. -type f -iname "inherits_browser.js" -print0 | xargs -0 rm -rf
find "${path}"/../.. -type f -iname "superagent.js" -print0 | xargs -0 rm -rf

find "${path}"/../.. -type d -ipath "*/moment*/src*" -print0 | xargs -0 rm -rf
find "${path}"/../.. -type d -ipath "*/moment*/min*" -print0 | xargs -0 rm -rf
find "${path}"/../.. -type f -ipath "*/dist/async.js" -print0 | xargs -0 rm -rf
find "${path}"/../.. -type f -ipath "*/dist/qs.js" -print0 | xargs -0 rm -rf
find "${path}"/../.. -type f -ipath "*/lib/es6-promise*" -print0 | xargs -0 rm -rf
find "${path}"/../.. -type f -ipath "*/build/*" -print0 | xargs -0 rm -rf

echo "Removing hooks directory due to uselessness"
rm -rf "${path}"/../hooks