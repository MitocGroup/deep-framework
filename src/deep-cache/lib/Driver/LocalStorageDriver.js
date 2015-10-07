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
  _has(key, callback = null) {
    callback = callback || function() {
      };

    callback(LocalStorageDriver._isAlive(LocalStorage.get(key), key));
  }

  /**
   * @param {String} key
   * @param {Function} callback
   */
  _get(key, callback = null) {
    callback = callback || function() {
      };

    let record = LocalStorage.get(key);

    callback(LocalStorageDriver._isAlive(record, key) ? record.value : null);
  }

  /**
   * @param {String} key
   * @param {*} value
   * @param {Number} ttl
   * @param {Function} callback
   * @returns {Boolean}
   */
  _set(key, value, ttl = 0, callback = null) {
    callback = callback || function() {
      };

    if (ttl <= 0) {
      LocalStorage.set(key, {value: value, exd: null});
    } else {
      LocalStorage.set(key, {value: value, exd: (LocalStorageDriver._now + ttl)});
    }

    callback(true);
  }

  /**
   * @param {String} key
   * @param {Number} timeout
   * @param {Function} callback
   */
  _invalidate(key, timeout = 0, callback = null) {
    callback = callback || function() {
      };

    if (timeout <= 0) {
      LocalStorage.remove(key);

      callback(true);
      return;
    }

    try {
      let record = LocalStorage.get(key);

      record.exd = LocalStorageDriver._now + timeout;

      LocalStorage.set(key, record);
    } catch (e) {
      // do nothing...
    }

    callback(true);
  }

  /**
   * @param {Function} callback
   * @returns {AbstractDriver}
   */
  _flush(callback = null) {
    callback = callback || function() {
      };

    LocalStorage.clear();

    callback(true);
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
   * @returns {*}
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
