'use strict';

import {PathAwareDriver} from '../../../lib.compiled/Local/Driver/PathAwareDriver';

export class PathAwareDriverMock extends PathAwareDriver {
  constructor() {
    super();

    this._methodsBehavior = new Map();

    this.setMode(PathAwareDriverMock.NO_RESULT_MODE);
  }

  /**
   * Returns callback for method based on behavior from _methodsBehavior map
   * @param {String} method
   * @param {Function} callback
   */
  getCallbackByMethod(method, callback) {
    switch (method) {
      case PathAwareDriverMock.NO_RESULT_MODE:
        callback(null, null);
        break;

      case PathAwareDriverMock.FAILURE_MODE:
        callback(PathAwareDriverMock.ERROR, null);
        break;

      case PathAwareDriverMock.DATA_MODE:
        callback(null, PathAwareDriverMock.DATA);
        break;
    }
  }

  /**
   * @param {Function} callback
   * @returns {PathAwareDriverMock}
   */
  _start(callback) {
    this.getCallbackByMethod(this._methodsBehavior.get('_start'), callback);

    return this;
  }

  /**
   * @param {Function} callback
   * @returns {PathAwareDriverMock}
   */
  _stop(callback) {
    this.getCallbackByMethod(this._methodsBehavior.get('_stop'), callback);

    return this;
  }

  /**
   * Set mode for passed methods
   * @param {Number} mode
   * @param {String[]} methods
   */
  setMode(mode = PathAwareDriverMock.NO_RESULT_MODE, methods = PathAwareDriverMock.METHODS) {

    if (PathAwareDriverMock.MODES.indexOf(mode) < 0) {
      mode = PathAwareDriverMock.NO_RESULT_MODE;
    }

    for (let method of methods) {
      if (PathAwareDriverMock.METHODS.indexOf(method) < 0) {
        continue;
      }

      this._methodsBehavior.set(method, mode);
    }
  }

  /**
   * @returns {number}
   * @constructor
   */
  static get NO_RESULT_MODE() {
    return 0;
  }

  /**
   * @returns {number}
   * @constructor
   */
  static get FAILURE_MODE() {
    return 1;
  }

  /**
   * @returns {number}
   * @constructor
   */
  static get DATA_MODE() {
    return 2;
  }

  /**
   * @returns {string[]}
   * @constructor
   */
  static get MODES() {
    return [
      PathAwareDriverMock.NO_RESULT_MODE,
      PathAwareDriverMock.FAILURE_MODE,
      PathAwareDriverMock.DATA_MODE,
    ];
  }

  /**
   * @returns {string}
   * @constructor
   */
  static get ERROR() {
    return {
      code: 500,
      message: 'Internal Error',
    };
  }

  /**
   * @returns {string}
   * @constructor
   */
  static get DATA() {
    return {
      status: 200,
      message: 'Operation successfully proccessed',
    };
  }

  /**
   * @returns {string[]}
   * @constructor
   */
  static get METHODS() {
    return [
      '_start',
      '_stop',
    ];
  }
}
