#!/usr/bin/env bash

# Skip on global installation or when fetched from registry
if [ ! ${npm_config_global} ] && [ -d 'lib/' ]; then
    bash scripts/browser_build.sh
else
    echo "Skipping browser build..."
fi
