/**
 * Created by AlexanderC on 6/16/15.
 */

'use strict';

import Core from 'deep-core';
import {MissingCacheException} from './Exception/MissingCacheException';
import {NoFlushException} from './Exception/NoFlushException';
import {DriverException} from './Exception/DriverException';

/**
 * Abstract driver implementation
 */
export class AbstractDriver extends Core.OOP.Interface {
  constructor() {
    super([
      '_get', '_has',
      '_set', '_invalidate',
    ]);

    this._buildId = '';
    this._namespace = '';
    this._silent = false;
  }

  /**
   * @returns {String}
   */
  get buildId() {
    return this._buildId;
  }

  /**
   * @param {String} id
   */
  set buildId(id) {
    this._buildId = id;
  }

  /**
   * @param {String} key
   * @param {Function} callback
   * @returns {AbstractDriver}
   */
  has(key, callback = () => {}) {
    try {
      this._has(this._buildKey(key), callback);
    } catch (e) {
      callback(new DriverException(e), null);
    }

    return this;
  }

  /**
   * @param {String} key
   * @param {Function} callback
   * @returns {AbstractDriver}
   */
  get(key, callback = () => {}) {
    try {
      this.has(key, (error, result) => {
        if (error) {
          callback(new DriverException(error), null);

          return;
        }

        if (!result && !this._silent) {
          callback(new MissingCacheException(key), null);

          return;
        }

        this._get(this._buildKey(key), callback);
      });
    } catch (e) {
      callback(new DriverException(e), null);
    }

    return this;
  }

  /**
   * @param {String} key
   * @param {*} value
   * @param {Number} ttl
   * @param {Function} callback
   */
  set(key, value, ttl = 0, callback = () => {}) {
    try {
      this._set(this._buildKey(key), value, ttl, callback);
    } catch (e) {
      callback(new DriverException(e), null);
    }
  }

  /**
   * @param {String} key
   * @param {Number} timeout
   * @param {Function} callback
   * @returns {AbstractDriver}
   */
  invalidate(key, timeout = 0, callback = () => {}) {
    try {
      this.has(key, (exception, result) => {
        if (exception) {
          callback(new DriverException(exception), null);

          return;
        }

        if (!result) {
          callback(null, true);

          return;
        }

        this._invalidate(this._buildKey(key), timeout, callback);
      });
    } catch (e) {
      callback(new DriverException(e), null);
    }

    return this;
  }

  /**
   * @param {Function} callback
   * @returns {AbstractDriver}
   */
  flush(callback = () => {}) {
    try {
      this._flush(callback);
    } catch (e) {
      callback(new DriverException(e), null);
    }

    return this;
  }

  /**
   * @private
   */
  _flush() {
    throw new NoFlushException();
  }

  /**
   * @returns {String}
   */
  get namespace() {
    return this._namespace;
  }

  /**
   * @param {String} ns
   */
  set namespace(ns) {
    this._namespace = ns;
  }

  /**
   * @param {Boolean} value
   */
  set silent(value) {
    this._silent = value;
  }

  /**
   * @returns {Boolean}
   */
  get silent() {
    return this._silent;
  }

  /**
   * @param {String} key
   * @returns {String}
   * @private
   */
  _buildKey(key) {
    return `${this._buildId}:${this._namespace}#${key}`;
  }
}
