'use strict';

const AWS_SERVICES = 'lambda,cognitoidentity,cognitosync,sqs';
const NULL_MODULES = [
  'mv',                     // @junk (bunyan shim) 
  'safe-json-stringify',    // @junk (bunyan shim)
  'dtrace-provider',        // @junk (bunyan shim)
  'source-map-support',     // @junk (bunyan shim)
  'vertx',                  // @junk (es6-promise uses native implementation)
  'ioredis',                // @junk (deep-cache not implemented)
];

module.exports = function () {
  const webpack = require('webpack');
  const path = require('path');
  const nullModulePath = path.resolve(__dirname, 'scripts', 'webpack.null-module.js');
  const config = {
    entry: 'browser-framework.js',
    context: path.resolve(__dirname, 'lib.compiled'),
    output: {
      path: path.resolve(__dirname, 'browser'),
      filename: 'framework.js',
      library: 'DeepFramework',
      libraryTarget: 'var',
    },
    resolve: {
      modules: [
        path.resolve(__dirname, 'lib.compiled'),
        path.resolve(__dirname, 'node_modules'),
      ],
      extensions: [ '.js', '.json' ],
      alias: {
        raven: 'raven-js',
        aws4: 'aws4-browser',
        'aws-sdk$': path.resolve(__dirname, 'scripts', 'aws.js'),
      },
    },
    externals: [
      'AWS',
    ],
    plugins: [
      new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en/),
      new webpack.optimize.OccurrenceOrderPlugin(),
      new webpack.DefinePlugin({
        'process.env': {
          'AWS_SERVICES': JSON.stringify(AWS_SERVICES),
          'NODE_ENV': JSON.stringify('production'),
        },
      }),
      new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: false,
      }),
      
      // @todo uncomment when fixed
      // @see https://github.com/webpack/webpack/issues/1542
      // new webpack.optimize.UglifyJsPlugin({
      //   beautify: false,
      //   mangle: {
      //     screw_ie8: true,
      //     keep_fnames: true,
      //   },
      //   compress: {
      //     screw_ie8: true,
      //   },
      //   comments: false,
      // }),
    ],
    watch: false,
    target: 'web',
    devtool: false,
    node: {
      crypto: true,
      global: true,
      process: true,
      __filename: 'mock',
      __dirname: 'mock',
      Buffer: true,
      setImmediate: true,
      dns: 'mock',
      fs: 'empty',
      path: true,
      net: 'mock',
    },
  };

  NULL_MODULES.forEach(nullModule => {
    config.resolve.alias[nullModule] = nullModulePath;
  });
  
  return config;
};
