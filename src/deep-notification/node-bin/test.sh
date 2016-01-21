if [ "$OSTYPE" != "msys" ] && [ "$OSTYPE" != "win32" ] && [ "$OSTYPE" != "win64" ]; then
    babel-node `which istanbul` cover --report lcovonly _mocha -- --ui tdd --recursive --reporter spec --timeout 4s
elif [ "$OSTYPE" == "win32" ] || [ "$OSTYPE" == "win64" ]; then
    echo "You should have installed and configured http://git-scm.com/ and run all bash command by using git-bash.exe"
else
    echo "Running from git-bash without gathering coverage"
    babel-node `which _mocha` --ui tdd --recursive --reporter spec
fi
