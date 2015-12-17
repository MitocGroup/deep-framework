/**
 * Created by CCristi <ccovali@mitocgroup.com> on 12/10/15.
 */

'use strict';

import Core from 'deep-core';

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
      'invalidate', 'flush'
    );
  }

  /**
   * @todo: use Promise when get rid of transpiler
   *
   * @param {Request} requestObject
   * @param {Function} callback
   * @returns {Promise}
   */
  request(requestObject, callback = () => {}) {
    let cacheKey = this.buildKeyFromRequest(requestObject);

    this._driver.has(cacheKey, (err, has) => {
      if (has) {
        this._driver.get(cacheKey, (err, data) => {
          if (err) {
            requestObject.send(callback);

            return;
          }

          callback(this._createSuccessfulResponse(data));
        });

        return;
      }

      requestObject.send(callback);
    });
  }

  /**
   * @param {Request} request
   * @returns {String}
   * @private
   */
  buildKeyFromRequest(request) {
    let action = request.action;
    let requestIdentifier = action.source[request.isLambda ? 'original' : 'api'];

    return `${requestIdentifier}#${JSON.stringify(request.payload)}`;
  }

  /**
   * @param {Runtime} runtime
   * @returns {String}
   */
  buildKeyFromLambdaRuntime(runtime) {
    let payload = JSON.stringify(runtime.request.data);

    return runtime.context && runtime.context.has('invokedFunctionArn')
      ? `${runtime.context.getOption('invokedFunctionArn')}#${payload}`
      : null;
  }

  /**
   * @param {Object} data
   * @returns {{isError: boolean, data: *, error: null, statusCode: number}}
   * @private
   */
  _createSuccessfulResponse(data) {
    return {
      data: data,
      statusCode: 200,
      isError: false,
      error: null,
    };
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
