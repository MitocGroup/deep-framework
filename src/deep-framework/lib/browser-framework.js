/**
 * Created by AlexanderC on 6/11/15.
 */

'use strict';

window.__DEEP_DEV_SERVER = global.__DEEP_DEV_SERVER = [
  'localhost', '127.0.0.1',
  '0.0.0.0', '::1',
].indexOf(window.location.hostname) !== -1;

if (/MSIE|Trident/.test(window.navigator.userAgent)) {
  require('./browser-ie-hooks');
}

const DeepFramework = require('./browser-bootstrap');

module.exports = DeepFramework;
