/**
 * Created by CCristi <ccovali@mitocgroup.com> on 4/21/16.
 */

'use strict';

/**
 * Resolves lambda response
 */
export class Resolver {
  /**
   * @param {Function} lambdaCallback
   */
  constructor(lambdaCallback) {
    this._lambdaCallback = lambdaCallback;
    this._onSucceed = [];
  }

  /**
   * @param {Object} object
   */
  succeed(object) {
    this._onSucceed.forEach(cb => cb(object));
    
    this._lambdaCallback(null, object);
  }

  /**
   * @param {Object} object
   */
  fail(object) {
    this._lambdaCallback(object, null);
  }

  /**
   * @param {Function} cb;
   */
  registerSucceedCallback(cb) {
    this._onSucceed.push(cb);
  }
}
