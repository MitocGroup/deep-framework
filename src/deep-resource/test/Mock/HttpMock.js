'use strict';

export class HttpMock {
  constructor() {
    this._methodsBehavior = new Map();
    this.setMode(HttpMock.NO_RESULT_MODE);
  }

  /**
   * @param {String} endpoint
   * @returns {HttpMock}
   */
  post(endpoint) {
    this.endpoint = endpoint;

    return this;
  }

  /**
   * @param {String} key
   * @param {*} value
   * @returns {HttpMock}
   */
  set(key, value) {
    this[key] = value;
    return this;
  }

  /**
   * @param {*} data
   * @returns {HttpMock}
   */
  send(data) {
    this.data = data;

    return this;
  }

  /**
   * @param {Function} callback
   * @returns {HttpMock}
   */
  end(callback) {
    switch (this._methodsBehavior.get('end')) {
      case HttpMock.NO_RESULT_MODE:
        callback(null, null);
        break;

      case HttpMock.FAILURE_MODE:
        callback(HttpMock.ERROR, null);
        break;

      case HttpMock.DATA_MODE:
        callback(null, HttpMock.DATA);
        break;
    }

    return this;
  }

  /**
   * Set mode for passed methods
   * @param {Number} mode
   * @param {String[]} methods
   */
  setMode(mode = HttpMock.NO_RESULT_MODE, methods = HttpMock.METHODS) {

    if (HttpMock.MODES.indexOf(mode) < 0) {
      mode = HttpMock.NO_RESULT_MODE;
    }

    for (let method of methods) {
      if (HttpMock.METHODS.indexOf(method) < 0) {
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
      HttpMock.NO_RESULT_MODE,
      HttpMock.FAILURE_MODE,
      HttpMock.DATA_MODE,
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
      'post',
      'set',
      'send',
      'end',
    ];
  }

  fixBabelTranspile() {
    for (let method of HttpMock.METHODS) {
      Object.defineProperty(this, method, {
        value: this[method],
        writable: false,
      });
    }
  }
}
