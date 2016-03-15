/**
 * Created by AlexanderC on 5/27/15.
 */

'use strict';

import path from 'path';

export class UniversalRequire {
  constructor() {
    this._require = this._guessRequireFunc();
  }

  /**
   * @param {String} module
   * @param {Function} cb
   * @returns {*}
   */
  require(module, cb) {
    if (UniversalRequire._isFrontend) {
      module = path.normalize(module); // avoid './' or '../'
    }

    return this._require(module, cb);
  }

  /**
   * @returns {Boolean}
   * @private
   */
  static get _isFrontend() {
    return typeof window !== 'undefined' &&
      typeof document !== 'undefined';
  }

  /**
   * @returns {Function}
   * @private
   */
  _guessRequireFunc() {
    if (!UniversalRequire._isFrontend) {
      return (module, cb) => {
        try {
          cb(null, require(module));
        } catch (e) {
          cb(e, null);
        }
      };
    }

    require('./require1k.js');

    return window.__deepRequireBrowser__;
  }
}
