#!/bin/bash

if [ -d './../scripts' ] && [ "$OSTYPE" != "win32" ] && [ "$OSTYPE" != "win64" ]; then
    sh ./../scripts/browser_build.sh
elif [ "$OSTYPE" == "win32" ] || [ "$OSTYPE" == "win64" ]; then
    echo "You should have installed and configured http://git-scm.com/ and run all bash command by using git-bash.exe"
fi
