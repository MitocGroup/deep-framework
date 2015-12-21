#!/usr/bin/env node
/**
 * Created by AlexanderC on 8/13/15.
 *
 * @todo: reuse this script from deep-framework
 */

// hook to make jscs tests pass!
var npmEnvKey = 'npm_config_production';

// @todo: populate ignores this dynamically
var skipModules = [
  'mocha', 'chai', 'sinon',
  'sinon-chai', 'istanbul',
  'jscoverage', 'jshint', 'jshint-stylish',
  'coveralls', 'karma', 'karma-mocha',
  'mocha-lcov-reporter'
];

if (process.env[npmEnvKey] !== 'true') {
  var path = require('path');
  var fs = require('fs');
  var exec = require('child_process').exec;

  var deepModulePath = path.join(__dirname, '../node_modules');

  if (!fs.existsSync(deepModulePath)) {
    console.error('Missing node_modules in ' + deepModulePath + '. Skipping...');
    process.exit(0);
  }

  fs.readdir(deepModulePath, function (error, files) {
    if (error) {
      console.error('Error while listing deep modules: ' + error);
      process.exit(1);
    }

    for (var i = 0; i < files.length; i++) {
      var basename = files[i];

      if (['.', '..'].indexOf(basename) === -1 && basename.indexOf('deep-') === 0) {
        var modulePath = path.join(deepModulePath, basename);

        if (!fs.existsSync(modulePath)) {
          console.error('Missing node_modules in ' + modulePath + '. Skipping...');
          continue;
        }

        fs.stat(modulePath, function (modulePath, error, stats) {
          if (error) {
            console.error('Error while getting stats of ' + modulePath + ': ' + error);
            process.exit(1);
          }

          if (stats.isDirectory()) {
            var packageFile = path.join(modulePath, 'package.json');

            fs.readFile(packageFile, function (error, data) {
              if (error) {
                console.error('Error while reading ' + packageFile + ': ' + error);
                process.exit(1);
              }

              var packageConfig = JSON.parse(data.toString());

              if (!packageConfig) {
                console.error('Broken JSON string in ' + packageFile + ': ' + error);
                process.exit(1);
              }

              var pckgsToInstall = [];

              var devDependencies = packageConfig.devDependencies || {};

              for (var depName in devDependencies) {
                if (!devDependencies.hasOwnProperty(depName)) {
                  continue;
                }

                if (skipModules.indexOf(depName) !== -1) {
                  continue;
                }

                var depVersion = devDependencies[depName];
                var depString = depName + '@' + depVersion;

                console.log('Adding NPM package ' + depString + ' to installation queue');

                pckgsToInstall.push(depString);
              }

              if (pckgsToInstall.length > 0) {
                var installCmd = 'cd ' + modulePath + ' && npm install ' + pckgsToInstall.join(' ');

                console.log('Running: ' + installCmd);

                exec(installCmd + ' &>/dev/null', function (error) {
                  if (error) {
                    console.error('Error while installing npm packages ' + pckgsToInstall.join(', ') + ': ' + error);
                    return;
                  }

                  console.log('The following NPM packages have been installed ' + pckgsToInstall.join(', '));
                }.bind(this));
              }
            }.bind(this));
          }
        }.bind(this, modulePath));
      }
    }
  });
}
