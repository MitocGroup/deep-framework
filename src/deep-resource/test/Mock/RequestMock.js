'use strict';

import {Request} from '../../lib/Resource/Request';

export class RequestMock extends Request {
  constructor(...args) {
    super(...args);

    this._methodsBehavior = new Map();
    this.setMode(RequestMock.NO_RESULT_MODE);
  }


  /**
   * Returns callback for method based on behavior from _methodsBehavior map
   * @param {String} mode
   * @param {Function} callback
   */
  getCallbackByMode(mode, callback) {
    switch (mode) {
      case RequestMock.NO_RESULT_MODE:
        callback(null, null);
        break;

      case RequestMock.FAILURE_MODE:
        callback(RequestMock.ERROR, null);
        break;

      case RequestMock.DATA_MODE:
        callback(null, RequestMock.DATA);
        break;
    }
  }

  /**
   * @param driver
   * @param key
   * @param {Function} callback
   * @returns {RequestMock}
   */
  loadResponseFromCache(driver, key, callback) {

    //hack to test shared cache
    if(key === 'to pass test'){
      callback(null, RequestMock.DATA);
    } else {
      this.getCallbackByMode(this._methodsBehavior.get('loadResponseFromCache'), callback);
    }

    return this;
  }

  /**
   * Set mode for passed methods
   * @param {Number} mode
   * @param {String[]} methods
   */
  setMode(mode = RequestMock.NO_RESULT_MODE, methods = RequestMock.METHODS) {

    if (RequestMock.MODES.indexOf(mode) < 0) {
      mode = RequestMock.NO_RESULT_MODE;
    }

    for (let method of methods) {
      if (RequestMock.METHODS.indexOf(method) < 0) {
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
      RequestMock.NO_RESULT_MODE,
      RequestMock.FAILURE_MODE,
      RequestMock.DATA_MODE,
    ];
  }

  /**
   * @returns {string}
   * @constructor
   */
  static get ERROR() {
    return {
      code: 500,
      body: {
        message: 'Internal Error',
      },
    };
  }

  /**
   * @returns {string}
   * @constructor
   */
  static get DATA() {
    return {
      code: 200,
      body: {
        message: 'Test message',
      },
    };
  }

  /**
   * @returns {string[]}
   * @constructor
   */
  static get METHODS() {
    return [
      'loadResponseFromCache',
    ];
  }
}
