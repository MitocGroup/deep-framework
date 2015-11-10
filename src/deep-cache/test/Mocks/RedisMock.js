'use strict';

import Redis from 'ioredis';

export class RedisMock extends Redis {
  /**
   * @param args
   */
  constructor(...args) {
    super(args);
    this.disableError();
  }

  /**
   * Enable error in callback
   */
  enableError() {
    this.error = RedisMock.ERROR;
    this.data = null;
  }

  /**
   * Disable error in callback
   */
  disableError() {
    this.error = null;
    this.data = RedisMock.DATA;
  }

  /**
   * @param {String} key
   * @param {Function} callback
   * @returns {RedisNegativeMock}
   */
  exists(key, callback) {
    callback(this.error, this.data);

    return this;
  }

  /**
   * @param {String} key
   * @param {Function} callback
   * @returns {RedisNegativeMock}
   */
  get(key, callback) {
    callback(this.error, this.data);

    return this;
  }

  /**
   * @param {String} key
   * @param {*} value
   * @param {Number} ttl
   * @param {Function} callback
   * @returns {RedisNegativeMock}
   */
  set(key, value, ttl, callback) {
    callback(this.error, this.data);

    return this;
  }

  /**
   * @param {String} key
   * @param {Number} timeout
   * @param {Function} callback
   * @returns {RedisNegativeMock}
   */
  del(key, timeout, callback) {
    callback(this.error, this.data);

    return this;
  }

  /**
   * @param {Function} callback
   * @returns {RedisNegativeMock}
   */
  flushall(callback) {
    callback(this.error, this.data);

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
