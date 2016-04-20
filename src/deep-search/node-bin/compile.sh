#!/usr/bin/env bash
if [ "$TRAVIS" == "true" ] && [ "$npm_config_global" != "true" ]; then
    echo "Skipping code transpiling to ES5 because we are in travis"
elif [ -d 'lib/' ] && [ "$OSTYPE" != "win32" ] && [ "$OSTYPE" != "win64" ]; then
   deepify compile-es6 lib --out-dir lib.compiled -x .js;
elif [ "$OSTYPE" == "win32" ] || [ "$OSTYPE" == "win64" ]; then
   echo "You should have installed and configured http://git-scm.com/ and run all bash command by using git-bash.exe"
else
   echo "Skipping code transpiling to ES5..."
fi
