#!/usr/bin/env bash
npm install --no-bin-links --no-shrinkwrap  \
  webpack aws-sdk lodash store \
  raven-js aws4-browser node-libs-browser \
  uglifyjs-webpack-plugin mishoo/UglifyJS2#harmony-v2.8.22

webpack --config webpack.browser.js --progress --color --profile --json                     >  browser/stats.json

_git_name=$(git config --get user.name)
_git_email=$(git config --get user.email)

cp browser/framework.js browser/framework.js.$$
echo -e "/**\n * Built on `date` by $_git_name <$_git_email>\n *"                           >  browser/framework.js
npm ls deep-framework --depth 1 --silent --long false | grep deep- | awk '{print " * "$1}'  >> browser/framework.js
npm ls --depth 1 --silent --long false | grep deep- | awk '{print " * "$2}' | tail -n+2     >> browser/framework.js
echo -e " **/\n"                                                                            >> browser/framework.js
cat browser/framework.js.$$                                                                 >> browser/framework.js
rm -f browser/framework.js.$$
