/**
 * Created by AlexanderC on 6/16/15.
 */

'use strict';

import {AbstractDriver} from './AbstractDriver';
import {RedisClusterException} from './Exception/RedisClusterException';
import Redis from 'ioredis';
import RedisAutoDiscovery from 'ecad';

/**
 * Redis/Elasticache driver implementation
 */
export class RedisDriver extends AbstractDriver {
  /**
   * @param {String} dsn
   */
  constructor(dsn) {
    super();

    this._autoDiscoveryError = null;
    this._client = null;

    this._autoDiscover(dsn);
  }

  /**
   * @param {String} dsn
   * @private
   */
  _autoDiscover(dsn) {
    let payload = {
      endpoints: [dsn,],
      timeout: RedisDriver.DEFAULT_AUTO_DISCOVERY_TIMEOUT,
    };

    let client = new RedisAutoDiscovery(payload);

    client.fetch((error, hosts) => {
      if (error) {
        this._autoDiscoveryError = error;
      } else {
        let options = {
          sentinels: [],
          name: dsn,
        };

        hosts.forEach((host) => {
          options.sentinels.push(`redis://${host}/`);
        });

        this._client = new this.NATIVE_DRIVER(options);
      }
    });
  }

  /**
   * @param {Function} cb
   * @private
   */
  clientWait(cb) {
    if (this._client) {
      cb(null, this._client);
    } else if (this._autoDiscoveryError) {
      cb(this._autoDiscoveryError, null);
    } else {
      setTimeout(() => {
        process.nextTick(() => {
          this.clientWait(cb);
        });
      }, RedisDriver.CLIENT_WAIT_MS_INTERVAL);
    }
  }

  /**
   * @returns {String}
   * @private
   */
  _type() {
    return 'Redis';
  }

  /**
   * @returns {Error|String|null}
   */
  get autoDiscoveryError() {
    return this._autoDiscoveryError;
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
    this.clientWait((error, client) => {
      if (error) {
        callback(new RedisClusterException(error), null);
        return;
      }

      client.exists(key, (error, results) => {
        if (error) {
          callback(new RedisClusterException(error), null);
          return;
        }

        callback(null, results);
      });
    });
  }

  /**
   * @param {String} key
   * @param {Function} callback
   */
  _get(key, callback = () => {}) {
    this.clientWait((error, client) => {
      if (error) {
        callback(new RedisClusterException(error), null);
        return;
      }

      client.get(key, (error, results) => {
        if (error) {
          callback(new RedisClusterException(error), null);

          return;
        }

        callback(null, results);
      });
    });
  }

  /**
   * @param {String} key
   * @param {*} value
   * @param {Number} ttl
   * @param {Function} callback
   */
  _set(key, value, ttl = 0, callback = () => {}) {
    this.clientWait((error, client) => {
      if (error) {
        callback(new RedisClusterException(error), null);
        return;
      }

      client.set(key, value, ttl, (error) => {
        if (error) {
          callback(new RedisClusterException(error), null);

          return;
        }

        callback(null, true);
      });
    });
  }

  /**
   * @param {String} key
   * @param {Number} timeout
   * @param {Function} callback
   */
  _invalidate(key, timeout = 0, callback = () => {}) {
    this.clientWait((error, client) => {
      if (error) {
        callback(new RedisClusterException(error), null);
        return;
      }

      client.del(key, timeout, (error) => {
        if (error) {
          callback(new RedisClusterException(error), null);

          return;
        }

        callback(null, true);
      });
    });
  }

  /**
   * @param {Function} callback
   */
  _flush(callback = () => {}) {
    this.clientWait((error, client) => {
      if (error) {
        callback(new RedisClusterException(error), null);
        return;
      }

      client.flushall((error) => {
        if (error) {
          callback(new RedisClusterException(error), null);

          return;
        }

        callback(null, true);
      });
    });
  }

  /**
   * @returns {*|exports|module.exports}
   * @constructor
   */
  get NATIVE_DRIVER() {
    return Redis;
  }

  /**
   * @returns {Number}
   */
  static get CLIENT_WAIT_MS_INTERVAL() {
    return 5;
  }

  /**
   * @returns {Number}
   */
  static get DEFAULT_AUTO_DISCOVERY_TIMEOUT() {
    return 700;
  }
}
