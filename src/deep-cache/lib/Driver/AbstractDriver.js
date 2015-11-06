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
   * @param {Function|null} callback
   * @returns {AbstractDriver}
   */
  has(key, callback = () => {}) {
    try {
      this._has(this._buildKey(key), function(result) {
        callback(undefined, result);
      }.bind(this));
    } catch (e) {
      callback(new DriverException(e), undefined);
    }

    return this;
  }

  /**
   * @param {String} key
   * @param {Function|null} callback
   * @returns {AbstractDriver}
   */
  get(key, callback = () => {}) {
    try {
      this.has(key, function(exception, result) {
        if (exception) {
          throw exception;
        }

        if (!result && !this._silent) {
          throw new MissingCacheException(key);
        }

        this._get(this._buildKey(key), function(result) {
          callback(undefined, result);
        }.bind(this));
      }.bind(this));
    } catch (e) {
      callback(new DriverException(e), undefined);
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
      this._set(this._buildKey(key), value, ttl, function(result) {
        callback(undefined, result);
      }.bind(this));
    } catch (e) {
      callback(new DriverException(e), undefined);
    }
  }

  /**
   * @param {String} key
   * @param {Number} timeout
   * @param {Function|null} callback
   * @returns {AbstractDriver}
   */
  invalidate(key, timeout = 0, callback = () => {}) {
    try {
      this.has(key, function(exception, result) {
        if (exception) {
          throw exception;
        }

        if (!result) {
          throw new MissingCacheException(key);
        }

        this._invalidate(this._buildKey(key), timeout, function(result) {
          callback(undefined, result);
        }.bind(this));
      }.bind(this));
    } catch (e) {
      callback(new DriverException(e), null);
    }

    return this;
  }

  /**
   * @param {Function|null} callback
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
