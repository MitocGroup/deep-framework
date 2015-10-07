/**
 * Created by AlexanderC on 6/16/15.
 */

'use strict';

import {AbstractDriver} from './AbstractDriver';
import Redis from 'ioredis';
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

    this._client = dsn ? new Redis(dsn) : new Redis();
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
  _has(key, callback = () => '') {
    this._client.exists(key, function(error, results) {
      if (error && error !== null) {
        throw new RedisClusterException(error);
      }

      callback(results);
    }.bind(this));
  }

  /**
   * @param {String} key
   * @param {Function} callback
   */
  _get(key, callback = () => '') {
    this._client.get(key, function(error, results) {
      if (error && error !== null) {
        throw new RedisClusterException(error);
      }

      callback(results);
    }.bind(this));
  }

  /**
   * @param {String} key
   * @param {*} value
   * @param {Number} ttl
   * @param {Function} callback
   * @returns {Boolean}
   */
  _set(key, value, ttl = 0,callback = () => '') {
    this._client.set(key, value, ttl, function(error) {
      if (error && error !== null) {
        throw new RedisClusterException(error);
      }

      callback(true);
    }.bind(this));
  }

  /**
   * @param {String} key
   * @param {Number} timeout
   * @param {Function} callback
   */
  _invalidate(key, timeout = 0, callback = () => '') {
    this._client.del(key, timeout, function(error) {
      if (error && error !== null) {
        throw new RedisClusterException(error);
      }

      callback(true);
    }.bind(this));
  }

  /**
   * @param {Function} callback
   * @returns {AbstractDriver}
   */
  _flush(callback = () => '') {
    this._client.flushall(function(error) {
      if (error && error !== null) {
        throw new RedisClusterException(error);
      }

      callback(true);
    }.bind(this));
  }
}
