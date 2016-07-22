#!/usr/bin/env bash
#
# Created by vcernomschi on 20/06/2015
#

source $(dirname $0)/_head.sh

if [ $(IS_ENV_VARS_AVAILABLE) == "1" ]; then

  ################################################
  ### Transpile from ES6 to ES5 by using babel ###
  ################################################
  cd $(dirname $0) && babel -x ".es6" ./ --out-dir=./ --presets="../../../node_modules/babel-preset-es2015"

  ##########################################################################################################
  ### Merge coverage results, compare with s3 report, add comments and update report in s3 if applicable ###
  ##########################################################################################################
  node ./node-scripts/CoverageManager.js
fi
