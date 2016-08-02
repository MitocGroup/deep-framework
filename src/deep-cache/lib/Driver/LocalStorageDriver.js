/**
 * Created by AlexanderC on 6/16/15.
 */

'use strict';

import {AbstractDriver} from './AbstractDriver';
import LocalStorage from 'store';

/**
 * In memory driver implementation
 */
export class LocalStorageDriver extends AbstractDriver {
  constructor() {
    super();
  }

  /**
   * @returns {String}
   * @private
   */
  _type() {
    return 'LocalStorage';
  }

  /**
   * @param {String} key
   * @param {Function} callback
   */
  _has(key, callback = () => {}) {
    callback(null, LocalStorageDriver._isAlive(LocalStorage.get(key), key));
  }

  /**
   * @param {String} key
   * @param {Function} callback
   */
  _get(key, callback = () => {}) {
    let record = LocalStorage.get(key);

    callback(null, LocalStorageDriver._isAlive(record, key) ? record.value : null);
  }

  /**
   * @param {String} key
   * @param {*} value
   * @param {Number} ttl
   * @param {Function} callback
   */
  _set(key, value, ttl = 0, callback = () => {}) {
    let exd = ttl > 0 ? LocalStorageDriver._now + ttl : null;

    try {
      LocalStorage.set(key, {value: value, exd: exd});
      callback(null, true);

    } catch (error) {
      if (this._isQuotaExceededError(error) && this._flushStale()) {
        this._set(key, value, ttl, callback);
      }

      callback(error, false);
    }
  }

  /**
   * @param {String} key
   * @param {Number} timeout
   * @param {Function} callback
   */
  _invalidate(key, timeout = 0, callback = () => {}) {
    if (timeout <= 0) {
      LocalStorage.remove(key);

      callback(null, true);

      return;
    }

    try {
      let record = LocalStorage.get(key);

      record.exd = LocalStorageDriver._now + timeout;

      LocalStorage.set(key, record);
    } catch (e) {
      // do nothing...
    }

    callback(null, true);
  }

  /**
   * @param {Function} callback
   */
  _flush(callback = () => {}) {
    LocalStorage.clear();

    callback(null, true);
  }

  /**
   * @returns {boolean}
   * @private
   */
  _flushStale() {
    let keysToRemove = [];

    LocalStorage.forEach((key, val) => {
      // @note - do not remove keys from cache at iteration time, it breaks the loop
      if (this.isDeepKey(key) &&
        !LocalStorageDriver._isAlive(val, key, false) ||
        this._getKeyBuildId(key) !== this._buildId) {
        keysToRemove.push(key);
      }
    });

    keysToRemove.forEach((key) => {
      LocalStorage.remove(key);
    });

    return keysToRemove.length > 0;
  }

  /**
   * @see http://chrisberkhout.com/blog/localstorage-errors/
   *
   * @param {Object} error
   * @returns {Boolean}
   * @private
   */
  _isQuotaExceededError(error) {
    let quotaExceededErrors = [
      'QuotaExceededError',
      'QUOTA_EXCEEDED_ERR',
      'NS_ERROR_DOM_QUOTA_REACHED'
    ];

    return quotaExceededErrors.indexOf(error.name) !== -1;
  }

  /**
   * @returns {Number}
   * @private
   */
  static get _now() {
    return parseInt(new Date().getTime() / 1000);
  }

  /**
   *
   * @param {Object} response
   * @param {String} key
   * @param {Boolean} removeStale
   * @returns {Boolean}
   * @private
   */
  static _isAlive(response, key, removeStale = true) {
    if (!response) {
      return false;
    }

    if (response.exd && response.exd <= LocalStorageDriver._now) {
      if (removeStale) {
        LocalStorage.remove(key);
      }
      return false;
    }

    return true;
  }

  /**
   * Checks for browser local storage availability
   *
   * @returns {boolean}
   */
  static isAvailable() {
    return LocalStorage.enabled;
  }
}
