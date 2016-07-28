/**
 * Created by AlexanderC on 6/11/15.
 */

'use strict';

if (typeof window !== 'undefined') {
  window.global = window.global || {};

  window.__DEEP_DEV_SERVER = window.global.__DEEP_DEV_SERVER = [
    'localhost', '127.0.0.1',
    '0.0.0.0', '::1',
  ].indexOf(window.location.hostname) !== -1;

  window.DeepFramework = window.DeepFramework || require('./browser-bootstrap');
}
