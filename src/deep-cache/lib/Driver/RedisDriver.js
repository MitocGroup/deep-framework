/**
 * Created by AlexanderC on 6/16/15.
 */

'use strict';

import {AbstractDriver} from './AbstractDriver';
import {RedisClusterException} from './Exception/RedisClusterException';

/**
 * Redis/Elasticache driver implementation
 */
export class RedisDriver extends AbstractDriver {
  /**
   * @param {String} dsn
   */
  constructor(dsn) {
    super();

    let nativeDriver = this.NATIVE_DRIVER;

    this._client = dsn ? new nativeDriver(dsn) : new nativeDriver();
  }

  /**
   * @returns {Redis}
   */
  get client() {
    return this._client;
  }

  /**
   * @param {String} key
   * @param {Function} callback
   */
  _has(key, callback = () => {}) {
    this._client.exists(key, (error, results) => {
      if (error) {
        callback(new RedisClusterException(error), null);

        return;
      }

      callback(null, results);
    });
  }

  /**
   * @param {String} key
   * @param {Function} callback
   */
  _get(key, callback = () => {}) {
    this._client.get(key, (error, results) => {
      if (error) {
        callback(new RedisClusterException(error), null);

        return;
      }

      callback(null, results);
    });
  }

  /**
   * @param {String} key
   * @param {*} value
   * @param {Number} ttl
   * @param {Function} callback
   * @returns {Boolean}
   */
  _set(key, value, ttl = 0, callback = () => {}) {
    this._client.set(key, value, ttl, (error) => {
      if (error) {
        callback(new RedisClusterException(error), null);

        return;
      }

      callback(null, true);
    });
  }

  /**
   * @param {String} key
   * @param {Number} timeout
   * @param {Function} callback
   */
  _invalidate(key, timeout = 0, callback = () => {}) {
    this._client.del(key, timeout, (error) => {
      if (error) {
        callback(new RedisClusterException(error), null);

        return;
      }

      callback(null, true);
    });
  }

  /**
   * @param {Function} callback
   * @returns {AbstractDriver}
   */
  _flush(callback = () => {}) {
    this._client.flushall((error) => {
      if (error) {
        callback(new RedisClusterException(error), null);

        return;
      }

      callback(null, true);
    });
  }

  /**
   * @returns {*|exports|module.exports}
   * @constructor
   */
  get NATIVE_DRIVER() {
    return require('ioredis');
  }
}
