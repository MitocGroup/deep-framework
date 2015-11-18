'use strict';

export class CacheMock {
  constructor() {
    this._container = null;
    this._driver = null;
    this._localBackend = false;
    this._microservice = null;
    this._methodsBehavior = new Map();
    this.setMode(CacheMock.NO_RESULT_MODE);
  }

  /**
   * Returns callback for method based on behavior from _methodsBehavior map
   * @param {String} method
   * @param {Function} callback
   */
  getCallbackByMetod(method, callback) {
    switch (method) {
      case CacheMock.NO_RESULT_MODE:
        callback(null, null);
        break;

      case CacheMock.FAILURE_MODE:
        callback(CacheMock.ERROR, null);
        break;

      case CacheMock.DATA_MODE:
        callback(null, CacheMock.DATA);
        break;
    }
  }

  /**
   * @param {String} cacheKey
   * @param {Function} callback
   * @returns {CacheMock}
   */
  has(cacheKey, callback) {
    this.getCallbackByMetod(this._methodsBehavior.get('has'), callback);

    return this;
  }

  /**
   * @param {String} cacheKey
   * @param {Number} number
   * @param {Function} callback
   * @returns {CacheMock}
   */
  invalidate(cacheKey, number, callback) {
    this.getCallbackByMetod(this._methodsBehavior.get('invalidate'), callback);

    return this;
  }

  /**
   * @param {String} cacheKey
   * @param {Function} callback
   * @returns {CacheMock}
   */
  get(cacheKey, callback) {
    this.getCallbackByMetod(this._methodsBehavior.get('get'), callback);

    return this;
  }

  /**
   * @param {String} cacheKey
   * @param {*} response
   * @param {Number} ttl
   * @param {Function} callback
   * @returns {CacheMock}
   */
  set(cacheKey, response, ttl, callback) {
    this.getCallbackByMetod(this._methodsBehavior.get('set'), callback);

    return this;
  }

  /**
   * Set mode for passed methods
   * @param {Number} mode
   * @param {String[]} methods
   */
  setMode(mode = CacheMock.NO_RESULT_MODE, methods = CacheMock.METHODS) {

    if (CacheMock.MODES.indexOf(mode) < 0) {
      mode = CacheMock.NO_RESULT_MODE;
    }

    for (let method of methods) {
      if (CacheMock.METHODS.indexOf(method) < 0) {
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
      CacheMock.NO_RESULT_MODE,
      CacheMock.FAILURE_MODE,
      CacheMock.DATA_MODE,
    ];
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