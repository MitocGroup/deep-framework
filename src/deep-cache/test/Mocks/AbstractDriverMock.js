'use strict';

import {AbstractDriver} from '../../lib.compiled/Driver/AbstractDriver';
import {NoFlushException} from '../../lib.compiled/Driver/Exception/NoFlushException';

export class AbstractDriverMock extends AbstractDriver {
  /**
   * @param args
   */
  constructor(...args) {
    super(args);
    this.disableFailureMode();
  }

  /**
   * Enables failure mode
   */
  enableFailureMode() {
    this.isFailureEnabled = true;
    this.error = AbstractDriverMock.ERROR;
    this.data = null;
  }

  /**
   * Disables failure mode
   */
  disableFailureMode() {
    this.isFailureEnabled = false;
    this.error = null;
    this.data = AbstractDriverMock.DATA;
  }

  /**
   * @param {String} key
   * @param {Function} callback
   * @returns {AbstractDriverMock}
   * @private
   */
  _get(key, callback = null) {
    callback(this.error, this.data);

    return this;
  }

  /**
   * @param {String} key
   * @param {Function} callback
   * @returns {AbstractDriverMock}
   * @private
   */
  _has(key, callback = null) {
    callback(this.error, this.data);

    return this;
  }

  /**
   * @param {String} key
   * @param {Number} timeout
   * @param {Function} callback
   * @returns {AbstractDriverMock}
   * @private
   */
  _invalidate(key, timeout = 0, callback = null) {
    callback(this.error, this.data);

    return this;
  }

  /**
   * @param {String} key
   * @param {*} value
   * @param {Number} ttl
   * @param {Function} callback
   * @returns {AbstractDriverMock}
   * @private
   */
  _set(key, value, ttl = 0, callback = null) {
    if (this.isFailureEnabled === true) {
      throw new DriverException('Implicitly test Driver Exception');
    } else {
      callback(this.error, this.data);
    }

    return this;
  }

  /**
   * @param {Function} callback
   * @returns {AbstractDriverMock}
   * @private
   */
  _flush(callback = null) {
    if (this.isFailureEnabled === true) {
      throw new NoFlushException();
    } else {
      callback(this.error, this.data);
    }

    return this;
  }

  /**
   * @returns {{code: number, message: string}}
   * @constructor
   */
  static get ERROR() {
    return {
      code: 500,
      message: 'Internal Error',
    };
  }

  /**
   * @returns {{data: string}}
   * @constructor
   */
  static get DATA() {
    return {
      data: 'Valid test data',
    };
  }
}
