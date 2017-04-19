#!/usr/bin/env bash
npm install --no-bin-links \
  webpack aws-sdk lodash store \
  raven-js aws4-browser node-libs-browser \
  uglifyjs-webpack-plugin mishoo/UglifyJS2#harmony
webpack --config webpack.browser.js --progress --color --profile --json > browser/stats.json 
