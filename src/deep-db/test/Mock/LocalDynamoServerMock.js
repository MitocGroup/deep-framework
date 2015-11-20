/**
 * Created by vcernomschi on 11/19/15.
 */

'use strict';

/**
 * LocalDynamo Server Mock
 */
export class LocalDynamoServerMock {
  constructor() {

    this._methodsBehavior = new Map();

    this.setMode(LocalDynamoServerMock.NO_RESULT_MODE);

  }

  /**
   * Returns callback for method based on behavior from _methodsBehavior map
   * @param {String} method
   * @param {Function} callback
   */
  getCallbackByMetod(method, callback) {
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
   * @param data
   * @param {Function} callback
   * @returns {LocalDynamoServerMock}
   */
  on(data, callback) {
    this.getCallbackByMetod(this._methodsBehavior.get('on'), callback);

    return this;
  }

  /**
   * @param {Object} options
   * @param {Number} port
   * @param {Function} callback
   * @returns {LocalDynamoServerMock}
   */
  launch(options, port, callback) {
    console.log('in launch')
    this.getCallbackByMetod(this._methodsBehavior.get('launch'), callback);

    return this;
  }

  /**
   * @param {Function} callback
   * @returns {LocalDynamoServerMock}
   */
  kill(callback) {
    this.getCallbackByMetod(this._methodsBehavior.get('kill'), callback);

    return this;
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
      'on',
    ];
  }
}
