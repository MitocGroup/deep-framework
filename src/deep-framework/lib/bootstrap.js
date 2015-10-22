/**
 * Created by AlexanderC on 5/22/15.
 *
 * Bootstrap file loaded by npm as main
 */

'use strict';

let Kernel = require('deep-kernel');

let services = {
  Asset: require('deep-asset'),
  Cache: require('deep-cache'),
  DB: require('deep-db'),
  FS: require('deep-fs'),
  Security: require('deep-security'),
  Resource: require('deep-resource'),
  Log: require('deep-log'),
  Validation: require('deep-validation'),

  //Notification: require('deep-notification'),
  //Event: require('deep-event'),
};

let exports = module.exports = {
  Kernel: new Kernel(services, Kernel.BACKEND_CONTEXT),
  Core: require('deep-core'),
  version: require('../package.json').version,
};
