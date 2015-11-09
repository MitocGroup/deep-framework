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
    if (ttl <= 0) {
      LocalStorage.set(key, {value: value, exd: null});
    } else {
      LocalStorage.set(key, {value: value, exd: (LocalStorageDriver._now + ttl)});
    }

    callback(null, true);
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
    return new Date().getTime();
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

    if (response.exd && response.exd !== null && response.exd <= LocalStorageDriver._now) {
      LocalStorage.remove(key);
      return false;
    }

    return true;
  }
}
