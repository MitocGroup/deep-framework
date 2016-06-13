#!/usr/bin/env bash
#
# Created by vcernomschi on 24/05/2016
#

if [ "$TRAVIS" == "true" ] && [ "$npm_config_global" != "true" ]; then

  ######################################################
  ### Skip transpile to ES5 when running from Travis ###
  ######################################################
  echo "Skipping code transpiling to ES5 because we are in travis"
elif [ -d 'lib/' ] && [ "$OSTYPE" != "win32" ] && [ "$OSTYPE" != "win64" ]; then

  #################################################################
  ### Transpile to ES5 when running on local and not on Windows ###
  #################################################################
  deepify compile es6 lib --out-dir lib.compiled -x .js;
elif [ "$OSTYPE" == "win32" ] || [ "$OSTYPE" == "win64" ]; then

  #####################################################
  ### Skip transpiling on Windows from command line ###
  #####################################################
  echo "You should have installed and configured http://git-scm.com/ and run all bash command by using git-bash.exe"
else

  ######################################################
  ### Skip transpiling if `lib` folder doesn't exist ###
  ######################################################
  echo "Skipping code transpiling to ES5..."
fi
