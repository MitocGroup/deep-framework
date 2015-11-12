'use strict';

//import Http from 'superagent';

export class HttpMock {
//export class HttpMock extends Http {
  constructor(...args) {
   // super(args);
    this._methodsBehavior = new Map();
    this.enableNoResultMode();
  }

  /**
   * @param {String} endpoint
   * @param {Function} callback
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
   * @param {String} endpoint
   * @param {Function} callback
   * @returns {HttpMock}
   */
  get(endpoint, callback) {
    switch (this._methodsBehavior.get('get')) {
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
   * @param {String} endpoint
   * @param {*} data
   * @param {Function} callback
   * @returns {HttpMock}
   */
  put(endpoint, data, callback) {
    switch (this._methodsBehavior.get('put')) {
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
   * @param {String} endpoint
   * @param {String} id
   * @param {*} data
   * @param {Function} callback
   * @returns {HttpMock}
   */
  patch(endpoint, id, data, callback) {
    switch (this._methodsBehavior.get('patch')) {
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
   * @param {String} endpoint
   * @param {String} id
   * @param {Function} callback
   * @returns {HttpMock}
   */
  delete(endpoint, id,  callback) {
    switch (this._methodsBehavior.get('delete')) {
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
   * @param {String} endpoint
   * @param {*} data
   * @param {Function} callback
   * @returns {HttpMock}
   */
  options(endpoint, data, callback) {
    switch (this._methodsBehavior.get('options')) {
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
   * @param {*} data
   * @param {Function} callback
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
    console.log('overrided end: ', this._methodsBehavior.get('end'))
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
        'get',
        'put',
        'patch',
        'delete',
        'options',
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
