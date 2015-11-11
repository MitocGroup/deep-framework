'use strict';

export class CacheMock {
  constructor() {
    this._container = null;
    this._driver = null;
    this._localBackend = false;
    this._microservice = null;
    this._methodsBehavior = new Map();
    this.enableNoResultMode();
  }

  has(cacheKey, callback) {

    switch (this._methodsBehavior.get('has')) {
      case CacheMock.NO_RESULT_MODE:
        callback(null, null);
        break;

      case CacheMock.FAILURE_MODE:
        callback(CacheMock.ERROR, null);
        break;

      case CacheMock.DATA_MODE:
        callback(null, CacheMock);
        break;
    }

    return this;
  }

  invalidate(cacheKey, number, callback) {
    switch (this._methodsBehavior.get('invalidate')) {
      case CacheMock.NO_RESULT_MODE:
        callback(null, null);
        break;

      case CacheMock.FAILURE_MODE:
        callback(CacheMock.ERROR, null);
        break;

      case CacheMock.DATA_MODE:
        callback(null, CacheMock);
        break;
    }

    return this;
  }

  get(cacheKey, cb) {
    switch (this._methodsBehavior.get('get')) {
      case CacheMock.NO_RESULT_MODE:
        callback(null, null);
        break;

      case CacheMock.FAILURE_MODE:
        callback(CacheMock.ERROR, null);
        break;

      case CacheMock.DATA_MODE:
        callback(null, CacheMock);
        break;
    }

    return this;
  }

  set(cacheKey, response, ttl, callback) {
    switch (this._methodsBehavior.get('set')) {
      case CacheMock.NO_RESULT_MODE:
        callback(null, null);
        break;

      case CacheMock.FAILURE_MODE:
        callback(CacheMock.ERROR, null);
        break;

      case CacheMock.DATA_MODE:
        callback(null, CacheMock);
        break;
    }

    return this;
  }

  /**
   * Enables no results mode
   * @param methods
   */
  enableNoResultMode() {
    for (let method of CacheMock.METHODS) {
      this._methodsBehavior.set(method, CacheMock.NO_RESULT_MODE);
    }
  }

  /**
   * Enables failure mode
   * @param methods
   */
  enableFailureMode() {
    for (let method of CacheMock.METHODS) {
      this._methodsBehavior.set(method, CacheMock.ERROR);
    }
  }

  /**
   * Disable failure mode
   * @param methods
   */
  disableFailureMode() {
    for (let method of CacheMock.METHODS) {
      this._methodsBehavior.set(method, CacheMock.DATA_MODE);
    }
  }

  /**
   * Enables no results mode for passed methods
   * @param methods
   */
  enableNoResultModeFor(methods) {
    for (let method of methods) {
      this._methodsBehavior.set(method, CacheMock.NO_RESULT_MODE);
    }
  }

  /**
   * Enables failure mode for passed methods
   * @param {String[]} methods
   */
  enableFailureModeFor(methods) {
    for (let method of methods) {
      this._methodsBehavior.set(method, CacheMock.FAILURE_MODE);
    }
  }

  /**
   * Disables failure mode for passed methods
   * @param methods
   */
  disableFailureModeFor(methods) {
    for (let method of methods) {
      this._methodsBehavior.set(method, CacheMock.DATA_MODE);
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
    return '{"code":500,"message":"Internal Error"}';
  }

  /**
   * @returns {string}
   * @constructor
   */
  static get DATA() {
    return '{"status":200,"message":"Test message","_class":"Response"}';
  }

  /**
   * @returns {string[]}
   * @constructor
   */
  static get METHODS() {
    return [
      'has',
      'invalidate',
      'get',
      'set',
    ];
  }
}