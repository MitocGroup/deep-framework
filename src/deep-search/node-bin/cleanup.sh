#!/usr/bin/env bash

if [ -d 'node_modules/elasticsearch/' ]; then
    echo "[INFO] - Cleaning up elasticsearch lib ..."

    # Saving default ES version
    mv node_modules/elasticsearch/src/lib/apis/2_3.js node_modules/elasticsearch/src/lib/apis/default.version

    # Removeing all other versions and bootstrapers
    rm -f node_modules/elasticsearch/src/lib/apis/*.js

    # Restoring saved default version
    mv node_modules/elasticsearch/src/lib/apis/default.version node_modules/elasticsearch/src/lib/apis/2_3.js

    # Adding custom bootstrapers
    cp node-bin/es-mocks/index.js node_modules/elasticsearch/src/lib/apis/
    cp node-bin/es-mocks/browser_index.js node_modules/elasticsearch/src/lib/apis/
fi