if [ "$TRAVIS" == "true" ]; then
    echo "Skipping code transpiling to ES5 becuase we are in travis"
elif [ -d 'lib/' ] && [ "$OSTYPE" != "win32" ] && [ "$OSTYPE" != "win64" ]; then
   BABEL_ENV=production babel lib/ --out-dir lib.compiled/;
elif [ "$OSTYPE" == "win32" ] || [ "$OSTYPE" == "win64" ]; then
   echo "You should have installed and configured http://git-scm.com/ and run all bash command by using git-bash.exe"
else
   echo "Skipping code transpiling to ES5..."
fi
