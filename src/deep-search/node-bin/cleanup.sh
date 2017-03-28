#!/usr/bin/env bash

if [ -d 'node_modules/elasticsearch/' ]; then
    echo "[INFO] - Cleaning up elasticsearch lib ..."

    # Saving default ES version
    mv node_modules/elasticsearch/src/lib/apis/2_3.js node_modules/elasticsearch/src/lib/apis/2_3.tmp
    mv node_modules/elasticsearch/src/lib/apis/1_5.js node_modules/elasticsearch/src/lib/apis/1_5.tmp
    mv node_modules/elasticsearch/src/lib/apis/5_x.js node_modules/elasticsearch/src/lib/apis/5_1.tmp

    # Removeing all other versions and bootstrapers
    rm -f node_modules/elasticsearch/src/lib/apis/*.js

    # Restoring saved default version
    # Please ensure es-mocks are up to date!!!
    mv node_modules/elasticsearch/src/lib/apis/2_3.tmp node_modules/elasticsearch/src/lib/apis/2_3.js
    mv node_modules/elasticsearch/src/lib/apis/1_5.tmp node_modules/elasticsearch/src/lib/apis/1_5.js
    mv node_modules/elasticsearch/src/lib/apis/5_1.tmp node_modules/elasticsearch/src/lib/apis/5_1.js

    # Adding custom bootstrapers
    cp node-bin/es-mocks/index.js node_modules/elasticsearch/src/lib/apis/
    cp node-bin/es-mocks/browser_index.js node_modules/elasticsearch/src/lib/apis/
fi