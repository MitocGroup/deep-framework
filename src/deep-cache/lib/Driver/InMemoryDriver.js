/**
 * Created by AlexanderC on 6/16/15.
 */

'use strict';

import {AbstractDriver} from './AbstractDriver';

/**
 * In memory driver implementation
 */
export class InMemoryDriver extends AbstractDriver {
  constructor() {
    super();

    this._storage = {};
  }

  /**
   * @returns {Object}
   */
  get storage() {
    return this._storage;
  }

  /**
   * @param {String} key
   * @param {Function} callback
   */
  _has(key, callback = () => '') {
    if (typeof this._storage[key] === 'undefined' || this._storage[key][1] === false) {
      callback(false);
      return;
    }

    let result = this._storage[key][1] < InMemoryDriver._now;

    if (!result) {
      this._invalidate(key);
    }

    callback(result);
  }

  /**
   * @param {String} key
   * @param {Function} callback
   */
  _get(key, callback = () => undefined) {
    callback(this._storage[key]);
  }

  /**
   * @param {String} key
   * @param {*} value
   * @param {Number} ttl
   * @param {Function} callback
   * @returns {Boolean}
   */
  _set(key, value, ttl = 0, callback = () => undefined) {
    this._storage[key] = [value, ttl <= 0 ? false : (InMemoryDriver._now + ttl)];

    callback(true);
  }

  /**
   * @param {String} key
   * @param {Number} timeout
   * @param {Function} callback
   */
  _invalidate(key, timeout = 0, callback = () => undefined) {
    if (timeout <= 0) {
      delete this._storage[key];

      callback(true);
      return;
    }

    this._storage[key][1] = InMemoryDriver._now + timeout;

    callback(true);
  }

  /**
   * @param {Function} callback
   * @returns {AbstractDriver}
   */
  _flush(callback = () => undefined) {
    this._storage = {};

    callback(true);
  }

  /**
   * @returns {Number}
   * @private
   */
  static get _now() {
    return new Date().getTime();
  }
}
