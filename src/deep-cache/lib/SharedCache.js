/**
 * Created by CCristi <ccovali@mitocgroup.com> on 12/10/15.
 */

/*eslint handle-callback-err: 0*/

'use strict';

import Core from 'deep-core';
import util from 'util';
import crypto from 'crypto';
import {SharedKey as Key} from './SharedKey';

/**
 * Shared Cache
 */
export class SharedCache {
  /**
   * @param {AbstractDriver} driver
   */
  constructor(driver) {
    this._driver = driver;

    new Core.Generic.MethodsProxy(this)
      .proxyOverride(
      this._driver,
      'has', 'get', 'set',
      'invalidate', 'flush', 'type'
    );
  }

  /**
   * @param {Request} request
   * @returns {Key}
   */
  buildKeyFromRequest(request) {
    let action = request.action;
    let microservice = action.resource.microservice;
    let requestIdentifier = action.source[request.isLambda ? 'original' : 'api'];
    let keyString = `${requestIdentifier}#${SharedCache._stringifyPayload(request.payload)}`;

    return new Key(keyString, microservice);
  }

  /**
   * @param {Runtime} runtime
   * @returns {String}
   */
  buildKeyFromLambdaRuntime(runtime) {
    return runtime.context && runtime.context.has('invokedFunctionArn') ?
      `${runtime.context.getOption('invokedFunctionArn')}#${SharedCache._stringifyPayload(runtime.request.data)}` :
      null;
  }

  /**
   * @param {Object} payload
   * @return {String}
   * @private
   */
  static _stringifyPayload(payload) {
    return JSON.stringify(
      SharedCache._normalizeObject(payload)
    );
  }

  /**
   * @param {String} text
   * @param {String} alg
   * @returns {String}
   * @private
   */
  static _hash(text, alg = 'sha1') {
    return crypto.createHash(alg).update(text).digest('hex');
  }

  /**
   * @param {Object} data
   * @returns {Object}
   * @private
   */
  static _normalizeObject(data) {
    let normalizedData = {};

    Object.keys(data).sort().forEach((key) => {
      let value = data[key];

      if (util.isArray(value)) {
        value = value.sort();
      } else if(value !== null && typeof value === 'object') {
        value = SharedCache._normalizeObject(value);
      }

      normalizedData[key] = value;
    });

    return normalizedData;
  }

  /**
   * If key exists do nothing, else create it with specified parameters
   *
   * @param {String} key
   * @param {Object} value
   * @param {Number} ttl
   * @param {Function} callback
   */
  assure(key, value, ttl = 0, callback = () => {}) {
    this._driver.has(key, (err, has) => {
      if (!has) {
        this._driver.set(key, value, ttl, callback);

        return;
      }

      callback(null, true);
    });
  }
}
