#!/usr/bin/env bash
#
# Created by vcernomschi on 24/05/2016
#

if [ -d 'lib/' ] && [ "$OSTYPE" != "msys" ] && [ "$OSTYPE" != "win32" ] && [ "$OSTYPE" != "win64" ]; then

 #########################################################################
 ### Run with babel-node to support ES6 tests and have coverage in ES6 ###
 #########################################################################
 babel-node $(npm root -g)/istanbul/lib/cli.js cover `which _mocha` -- \
 --reporter spec --ui tdd --recursive --timeout 20s
elif [ "$OSTYPE" == "win32" ] || [ "$OSTYPE" == "win64" ]; then

 #################################################
 ### Skip running on Windows from command line ###
 #################################################
 echo "You should have installed and configured http://git-scm.com/ and run all bash command by using git-bash.exe"
elif [ -d 'lib/' ]; then

 #########################################
 ### Running from git-bash on Windows  ###
 #########################################
 echo "Running from git-bash with gathering coverage"
 babel-node $(npm root -g)/istanbul/lib/cli.js cover `which _mocha` -- \
 --reporter spec --ui tdd --recursive --timeout 20s
else

 ##################################################
 ### Skip running if `lib` folder doesn't exist ###
 ##################################################
 echo "Skipping testing..."
fi
