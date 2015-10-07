/**
 * Created by AlexanderC on 5/22/15.
 *
 * Bootstrap file loaded by npm as main
 */

'use strict';

let Kernel = require('deep-kernel');

let deepServices = {
  Asset: require('deep-asset'),
  Cache: require('deep-cache'),
  Security: require('deep-security'),
  Resource: require('deep-resource'),
  Log: require('deep-log'),
  Validation: require('deep-validation'),

  //Notification: require('deep-notification')
};

let exports = module.exports = {
  Kernel: new Kernel(deepServices, Kernel.FRONTEND_CONTEXT),
  Core: require('deep-core'),
};
