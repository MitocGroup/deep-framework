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
   * @returns {Boolean}
   */
  _set(key, value, ttl = 0, callback = () => {}) {
    let exd = ttl > 0 ? LocalStorageDriver._now + ttl : null;

    try {
      LocalStorage.set(key, {value: value, exd: exd});
      callback(null, true);

    } catch(error) {
      // @todo - check for QUOTA_EXCEEDED_ERR and find out a solution to cleanup "stale" values and re-try to set it
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
   * @returns {AbstractDriver}
   */
  _flush(callback = () => {}) {
    LocalStorage.clear();

    callback(null, true);
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
   * @returns {Boolean}
   * @private
   */
  static _isAlive(response, key) {
    if (!response) {
      return false;
    }

    if (response.exd && response.exd <= LocalStorageDriver._now) {
      LocalStorage.remove(key);
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
