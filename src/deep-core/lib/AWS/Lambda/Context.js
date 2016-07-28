/**
 * Created by CCristi <ccovali@mitocgroup.com> on 12/10/15.
 */

/*eslint no-undefined: 0*/

'use strict';

export class Context {
  /**
   * @param {Object} lambdaContext
   */
  constructor(lambdaContext) {
    this._lambdaContext = lambdaContext;

    this._registerDataAsOptions();
  }

  /**
   * @returns {Object}
   */
  get options() {
    return this._lambdaContext;
  }

  /**
   * @private
   */
  _registerDataAsOptions() {
    for (let key in this._lambdaContext) {
      if (!this._lambdaContext.hasOwnProperty(key)) {
        continue;
      }

      Object.defineProperty(this, key, {
        value: this._lambdaContext[key],
        writable: false,
        configurable: false,
        enumerable: true,
      });
    }

    // Avoid _data key listing on Object.keys(request)
    Object.defineProperty(this, '_options', {
      configurable: false,
      enumerable: false,
    });
  }

  /**
   * @param {String} option
   * @returns {boolean}
   */
  has(option) {
    return this._lambdaContext.hasOwnProperty(option);
  }

  /**
   * @param {String} option
   * @param {*} defaultValue
   * @returns {*}
   */
  getOption(option, defaultValue = undefined) {
    return this._lambdaContext.hasOwnProperty(option) ? this._lambdaContext[option] : defaultValue;
  }

  /**
   * Enables Callback wait for empty event loop
   */
  waitForEmptyEventLoop() {
    this._lambdaContext.callbackWaitsForEmptyEventLoop = true;
  }
}
