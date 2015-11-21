/**
 * Created by vcernomschi on 11/19/15.
 */

'use strict';

/**
 * LocalDynamo Server Mock, as singleton
 */
let instance = null;

export class LocalDynamoServerMock {
  constructor(options) {

    if (!instance) {
      this.options = options;
      this._methodsBehavior = new Map();
      this.setMode(LocalDynamoServerMock.DATA_MODE);
      this._isRunning = false;

      instance = this;
    }

    return instance;
  }

  /**
   * Returns standard callback(err, data) for method based on behavior from _methodsBehavior map
   * @param {String} method
   * @param {Function} callback
   */
  getCallbackByMethod(method, callback) {
    switch (method) {
      case LocalDynamoServerMock.NO_RESULT_MODE:
        callback(null, null);
        break;

      case LocalDynamoServerMock.FAILURE_MODE:
        callback(LocalDynamoServerMock.ERROR, null);
        break;

      case LocalDynamoServerMock.DATA_MODE:
        callback(null, LocalDynamoServerMock.DATA);
        break;
    }
  }

  /**
   * Returns callback() with on arg for method based on behavior from _methodsBehavior map
   * @param {String} method
   * @param {Boolean} isError
   * @param {Function} callback
   */
  getCustomCallbackByMethod(method, callback, isError = false) {
    switch (method) {
      case LocalDynamoServerMock.NO_RESULT_MODE:
        callback(null);
        break;

      case LocalDynamoServerMock.FAILURE_MODE:
        callback(LocalDynamoServerMock.ERROR);
        break;

      case LocalDynamoServerMock.DATA_MODE:
        callback(LocalDynamoServerMock.DATA);
        break;
    }
  }

  /**
   * @param data
   * @param {Function} callback
   * @returns {LocalDynamoServerMock}
   */
  on(data, callback) {
    this.getCustomCallbackByMethod(this._methodsBehavior.get('on'), callback, false);

    return this;
  }

  /**
   * @param {Object} options
   * @param {Number} port
   * @returns {LocalDynamoServerMock}
   */
  launch(options, port) {
    if (this.isRunning) {
      throw Error('Server already up and running');
    }

    this._isRunning = true;

    return this;
  }

  /**
   * @returns {LocalDynamoServerMock}
   */
  kill() {
    this._isRunning = false;

    return this;
  }

  /**
   * @returns {LocalDynamoServerMock}
   */
  get stdout() {
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
  setMode(mode = LocalDynamoServerMock.NO_RESULT_MODE, methods = LocalDynamoServerMock.METHODS) {

    if (LocalDynamoServerMock.MODES.indexOf(mode) < 0) {
      mode = LocalDynamoServerMock.NO_RESULT_MODE;
    }

    for (let method of methods) {
      if (LocalDynamoServerMock.METHODS.indexOf(method) < 0) {
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
      LocalDynamoServerMock.NO_RESULT_MODE,
      LocalDynamoServerMock.FAILURE_MODE,
      LocalDynamoServerMock.DATA_MODE,
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
      'launch',
      'kill',
      'stdout',
      'on',
    ];
  }

  fixBabelTranspile() {
    for (let method of LocalDynamoServerMock.METHODS) {
      Object.defineProperty(this, method, {
        value: this[method],
        writable: false,
      });
    }
  }
}
