'use strict';

export class HttpMock {
  constructor(...args) {
    this._methodsBehavior = new Map();
    this.enableNoResultMode();
  }

  /**
   * @param {String} endpoint
   * @returns {HttpMock}
   */
  post(endpoint) {
    switch (this._methodsBehavior.get('post')) {
      case HttpMock.NO_RESULT_MODE,
        HttpMock.FAILURE_MODE,
        HttpMock.DATA_MODE:
        break;
    }

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
    switch (this._methodsBehavior.get('send')) {
      case HttpMock.NO_RESULT_MODE,
        HttpMock.FAILURE_MODE,
        HttpMock.DATA_MODE:
        break;
    }

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
   * Enables no results mode
   * @param methods
   */
  enableNoResultMode() {
    for (let method of HttpMock.METHODS) {
      this._methodsBehavior.set(method, HttpMock.NO_RESULT_MODE);
    }
  }

  /**
   * Enables failure mode
   * @param methods
   */
  enableFailureMode() {
    for (let method of HttpMock.METHODS) {
      this._methodsBehavior.set(method, HttpMock.ERROR);
    }
  }

  /**
   * Disable failure mode
   * @param methods
   */
  disableFailureMode() {
    for (let method of HttpMock.METHODS) {
      this._methodsBehavior.set(method, HttpMock.DATA_MODE);
    }
  }

  /**
   * Enables no results mode for passed methods
   * @param methods
   */
  enableNoResultModeFor(methods) {
    for (let method of methods) {
      if (HttpMock.METHODS.indexOf(method) < 0) {
        continue;
      }

      this._methodsBehavior.set(method, HttpMock.NO_RESULT_MODE);
    }
  }

  /**
   * Enables failure mode for passed methods
   * @param {String[]} methods
   */
  enableFailureModeFor(methods) {
    for (let method of methods) {
      if (HttpMock.METHODS.indexOf(method) < 0) {
        continue;
      }

      this._methodsBehavior.set(method, HttpMock.FAILURE_MODE);
    }
  }

  /**
   * Disables failure mode for passed methods
   * @param methods
   */
  disableFailureModeFor(methods) {
    for (let method of methods) {
      if (HttpMock.METHODS.indexOf(method) < 0) {
        continue;
      }

      this._methodsBehavior.set(method, HttpMock.DATA_MODE);
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
