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
   * @returns {String}
   * @private
   */
  _type() {
    return 'InMemory';
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
  _has(key, callback = () => {}) {
    if (!this._storage.hasOwnProperty(key) || this._storage[key][1] === false) {
      callback(null, false);

      return;
    }

    let timedOut = this._storage[key][1] < InMemoryDriver._now;

    if (timedOut) {
      this._invalidate(key);

      callback(null, false);

      return;
    }

    callback(null, true);
  }

  /**
   * @param {String} key
   * @param {Function} callback
   */
  _get(key, callback = () => {}) {
    callback(null, this._storage[key]);
  }

  /**
   * @param {String} key
   * @param {*} value
   * @param {Number} ttl
   * @param {Function} callback
   */
  _set(key, value, ttl = 0, callback = () => {}) {
    this._storage[key] = [value, ttl <= 0 ? false : (InMemoryDriver._now + ttl)];

    callback(null, true);
  }

  /**
   * @param {String} key
   * @param {Number} timeout
   * @param {Function} callback
   */
  _invalidate(key, timeout = 0, callback = () => {}) {
    if (timeout <= 0) {
      delete this._storage[key];

      callback(null, true);

      return;
    }

    this._storage[key][1] = InMemoryDriver._now + timeout;

    callback(null, true);
  }

  /**
   * @param {Function} callback
   */
  _flush(callback = () => {}) {
    this._storage = {};

    callback(null, true);
  }

  /**
   * @returns {Number}
   * @private
   */
  static get _now() {
    return parseInt(new Date().getTime() / 1000);
  }
}
