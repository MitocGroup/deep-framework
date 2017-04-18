#!/usr/bin/env bash

npm link webpack aws-sdk
npm install --no-bin-links lodash store raven-js aws4-browser 
webpack --config webpack.browser.js --progress --color --profile --json > browser/stats.json 
