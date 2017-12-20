#!/usr/bin/env bash

if [ -z "$1" ]; then
  echo "You must provide library path"
  exit 1
fi

_pwd=$(pwd)
_lib="$1"

# todo: find a smarter fix
# Fixing "spawn sh ENOENT" issue
cd /

REQUIRED_DEPS=("aws-sdk" "babel-cli" "babel-plugin-add-module-exports" "babel-preset-node6");
NPM_BIN=`which npm`
NPM_GLOBAL_NM=`$NPM_BIN root -g`

echo "Checking babel-* dependencies in $NPM_GLOBAL_NM"

for DEP in ${REQUIRED_DEPS[@]}; do
  if [ ! -d "$NPM_GLOBAL_NM/$DEP" ]; then
    echo "Installing missing $DEP"
    "$NPM_BIN" install -g "$DEP" || (echo "Failed to install $DEP" && exit 1)
    echo "$DEP has been installed"
    echo ""
  fi
done

cd "$_pwd" || (echo "Failed to resume to $_pwd" && exit 1)
cd "$_lib" || (echo "Failed to pwd to lib path $_pwd" && exit 1)
babel lib/ --extensions='.js' --plugins="$NPM_GLOBAL_NM/babel-plugin-add-module-exports" --presets="$NPM_GLOBAL_NM/babel-preset-node6" --out-dir="lib.es6" || (echo "Failed to compile $_pwd" && exit 1)
