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
  }

  /**
   * @param {Object} object
   */
  succeed(object) {
    this._lambdaCallback(null, object);
  }

  /**
   * @param {Object} object
   */
  fail(object) {
    this._lambdaCallback(object, null);
  }
}
