#!/usr/bin/env bash

path=$(cd $(dirname $0); pwd -P)
npm=$(which npm)
browserify=$(which browserify)
brew=$(which brew)
uglifyjs=$(which uglifyjs)
browser_build_path="${path}/../browser"
DEEP_AWS_SERVICES=lambda,cognitoidentity,cognitosync

assure_brew() {
    if [ -z ${brew} ]; then
        echo "You may install Homebrew first!"
        exit 1
    fi
}

assure_uglifyjs() {
    if [ -z ${uglifyjs} ]; then
        assure_npm

        echo "Installing uglify-js..."
        ${npm} install -g uglify-js

        uglifyjs=$(which uglifyjs)
    fi
}


assure_npm() {
    if [ -z ${npm} ]; then
        assure_brew

        echo "Installing nodejs..."
        ${brew} install nodejs

        npm=$(which npm)
    fi
}

assure_browserify() {
    if [ -z ${browserify} ]; then
        assure_npm

        echo "Installing browserify..."
        ${npm} install -g browserify

        browserify=$(which browserify)
    fi
}

assure_npm
assure_browserify
assure_uglifyjs

echo "- Assure build directory"

mkdir -p ${browser_build_path}

echo "- Execute prepare hooks"

# @todo: move this into another script?
cd "${path}"/../node_modules/deep-log && \
    ${npm} run prepare-browserify

echo "- Lookup for node modules to require"

# used to require/exclude modules
NPM_REGEX='(src/deep-framework|.*((deep\-(fs|db|event)).*|lsmod|ioredis|vogels|raven(?!-js)).*)$'

# require
browserify_require=""
npm_modules=($("${path}"/npm_modules_lookup.js "${path}"/../ "($NPM_REGEX)" 'raven-js:raven'))
for module_entry_point in ${npm_modules[@]}; do
    browserify_require=${browserify_require}' -r '${module_entry_point}' '
done

echo ""
echo ${browserify_require}
echo ""

cd "${path}"/../

echo "- Start transpiling ES6"
${npm} run compile

__FW=${browser_build_path}"/framework.js"
echo '/** Built on '$(date) > ${__FW}
${npm} ls --long=false --global=false --depth=0 --production=true | sed 's/ \/.*//' | grep deep- >> ${__FW}
echo '*/' >> ${__FW}
AWS_SERVICES="$DEEP_AWS_SERVICES" ${browserify} -d ${browserify_require} lib.compiled/browser-framework.js | uglifyjs >> ${__FW}

echo ""
echo "- Completed!"
echo ""
