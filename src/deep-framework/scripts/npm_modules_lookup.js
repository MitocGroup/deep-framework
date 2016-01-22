#!/usr/bin/env node
/**
 * Created by AlexanderC on 8/14/15.
 */

'use strict';

var os = require('os');
var path = require('path');
var exec = require('child_process').exec;
var args = process.argv;
var filter = function (module) {
  return true;
};
var replacements = {};
var assureUnique = true; // change it to duplicate libs

if (args.length < 3) {
  console.error('Missing npm root');
  process.exit(1);
}

if (args.length >= 4) {
  filter = function (module) {
    var modulePath = module.replace(/:[^:]+$/, '');

    return !modulePath.match(new RegExp(args[3]));
  };
}

if (args.length >= 5) {
  var rawReplacements = args[4];

  var replacementsRawVector = rawReplacements.split(',');

  for (var i = 0; i < replacementsRawVector.length; i++) {
    var rawReplacement = replacementsRawVector[i];
    var replacementList = rawReplacement.split(':');

    if (replacementList.length !== 2) {
      console.error('Invalid replacement part ' + rawReplacement);
      process.exit(1);
    }

    replacements[replacementList[0]] = replacementList[1];
  }
}

var npmRoot = args[2];

if (npmRoot.indexOf('/') !== 0) {
  npmRoot = path.join(process.cwd(), npmRoot);
}

exec('cd ' + npmRoot + ' && npm ls --parseable --silent --long', function (error, stdout, stderr) {
  var modulesRawList = stdout.split(os.EOL);
  var foundModules = [];

  for (var line in modulesRawList) {
    if (!modulesRawList.hasOwnProperty(line)) {
      continue;
    }

    var moduleRawLine = modulesRawList[line];
    var module = moduleRawLine.replace(/@[^@]+:?$/i, '');
    var moduleList = module.split(':');

    if (module) {
      if (moduleList.length !== 2) {
        console.error('Invalid module path ' + module);
        process.exit(1);
      }

      if (filter(module)) {
        if (foundModules.indexOf(moduleList[1]) !== -1) {
          continue;
        }

        foundModules.push(moduleList[1]);

        var nameReplacement = replacements[moduleList[1]];
        var moduleOutput = nameReplacement
          ? module.replace(new RegExp(':' + moduleList[1] + '$'), ':' + nameReplacement)
          : module;

        console.log(moduleOutput);
      }
    }
  }
});
