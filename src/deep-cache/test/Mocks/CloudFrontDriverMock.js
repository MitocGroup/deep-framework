'use strict';

import {CloudFrontDriver} from '../../lib/Driver/CloudFrontDriver';

export class CloudFrontDriverMock extends CloudFrontDriver  {
  /**
   * @param args
   */
  constructor(...args) {
    super(...args);

    this._methodsBehavior = new Map();

    this.setMode();
  }

  /**
   * Set mode for passed methods
   * @param {Number} mode
   * @param {String[]} methods
   */
  setMode(mode = CloudFrontDriverMock.NO_RESULT_MODE, methods = CloudFrontDriverMock.METHODS) {

    if (CloudFrontDriverMock.MODES.indexOf(mode) < 0) {
      mode = CloudFrontDriverMock.NO_RESULT_MODE;
    }

    for (let method of methods) {
      if (CloudFrontDriverMock.METHODS.indexOf(method) < 0) {
        continue;
      }

      this._methodsBehavior.set(method, mode);
    }
  }

  /**
   * Returns callback for method based on behavior from _methodsBehavior map
   * @param {String} method
   * @param {Function} callback
   */
  getCallbackByMethod(method, callback) {
    switch (method) {
      case CloudFrontDriverMock.NO_RESULT_MODE:
        callback(null, CloudFrontDriverMock.EMPTY_OBJECT);
        break;

      case CloudFrontDriverMock.FAILURE_MODE:
        callback(CloudFrontDriverMock.ERROR, null);
        break;

      case CloudFrontDriverMock.EXCEPTION_MODE:
        callback(null, CloudFrontDriverMock.TO_THROW_EXCEPTION);
        break;

      case CloudFrontDriverMock.DATA_MODE:
        callback(null, CloudFrontDriverMock.DATA);
        break;

      case CloudFrontDriverMock.UPDATE_MODE:
        callback(null, CloudFrontDriverMock.UPDATED_DATA);
        break;
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
  static get EXCEPTION_MODE() {
    return 2;
  }

  /**
   * @returns {number}
   * @constructor
   */
  static get DATA_MODE() {
    return 3;
  }

  /**
   * @returns {number}
   * @constructor
   */
  static get UPDATE_MODE() {
    return 4;
  }

  /**
   * @returns {string[]}
   * @constructor
   */
  static get MODES() {
    return [
      CloudFrontDriverMock.NO_RESULT_MODE,
      CloudFrontDriverMock.FAILURE_MODE,
      CloudFrontDriverMock.EXCEPTION_MODE,
      CloudFrontDriverMock.DATA_MODE,
      CloudFrontDriverMock.UPDATE_MODE,
    ];
  }

  /**
   * @returns {{code: number, message: string}}
   * @constructor
   */
  static get TO_THROW_EXCEPTION() {
    return 'will throw exception to parse this';
  }

  /**
   * @returns {{code: number, message: string}}
   * @constructor
   */
  static get ERROR() {
    return '{"code":"500","data":"null","message":"Internal Error"}';
  }

  /**
   * @returns {{data: string}}
   * @constructor
   */
  static get DATA() {
    return '{"code":"200","value":"request successfully sent","buildId":""}';
  }

  /**
   * @returns {{data: string}}
   * @constructor
   */
  static get UPDATED_DATA() {
    return '{"code":"200","value":"request successfully sent and updated data","buildId":"testBuildId01234"}';
  }

  /**
   * @returns {{data: string}}
   * @constructor
   */
  static get EMPTY_OBJECT() {
    return '{}';
  }

  /**
   * @param {String} url
   * @param {Function} callback
   * @private
   */
  _request(url, callback) {
    this.getCallbackByMethod(this._methodsBehavior.get('_request'), callback);

    return this;
  }

  /**
   * @returns {string[]}
   * @constructor
   */
  static get METHODS() {
    return [
      '_request',
    ];
  }

  fixBabelTranspile() {
    for (let method of CloudFrontDriverMock.METHODS) {
      Object.defineProperty(this, method, {
        value: this[method],
        writable: false,
      });
    }
  }
}
