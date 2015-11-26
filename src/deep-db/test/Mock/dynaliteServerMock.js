/**
 * Created by vcernomschi on 11/20/15.
 */

'use strict';

/**
 * Dynalite Server Mock, as singleton
 */
let instance = null;

class DynaliteServer {
  constructor(options) {

    if(!instance) {
      this.options = options;
      this._methodsBehavior = new Map();
      this.setMode(DynaliteServer.NO_RESULT_MODE);
      this._isRunning = false;

      instance = this;
    }

    return instance;
  }

  /**
   * Returns callback for method based on behavior from _methodsBehavior map
   * @param {String} method
   * @param {Function} callback
   */
  getCallbackByMethod(method, callback) {
    switch (method) {
      case DynaliteServer.NO_RESULT_MODE:
        callback(null, null);
        break;

      case DynaliteServer.FAILURE_MODE:
        callback(DynaliteServer.ERROR, null);
        break;

      case DynaliteServer.DATA_MODE:
        callback(null, DynaliteServer.DATA);
        break;
    }

  }

  /**
   * @param {Function} callback
   * @returns {DynaliteServer}
   */
  close(callback) {
    this.getCallbackByMethod(this._methodsBehavior.get('close'), callback);

    this._isRunning = false;

    return this;
  }

  /**
   * @param {Number} port
   * @param {Function} callback
   * @returns {*}
   */
  listen(port, callback) {
    this.getCallbackByMethod(this._methodsBehavior.get('listen'), callback);

    this._isRunning = true;

    return this;
  }

  /**
   * @returns {Boolean}
   */
  get isRunning() {
    return this._isRunning;
  }

  /**
   * Set mode for passed methods
   * @param {Number} mode
   * @param {String[]} methods
   */
  setMode(mode = DynaliteServer.NO_RESULT_MODE, methods = DynaliteServer.METHODS) {

    if (DynaliteServer.MODES.indexOf(mode) < 0) {
      mode = DynaliteServer.NO_RESULT_MODE;
    }

    for (let method of methods) {
      if (DynaliteServer.METHODS.indexOf(method) < 0) {
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
      DynaliteServer.NO_RESULT_MODE,
      DynaliteServer.FAILURE_MODE,
      DynaliteServer.DATA_MODE,
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
      'close',
      'listen',
    ];
  }
}

export default function(options) {
  return new DynaliteServer(options);
}
