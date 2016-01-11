/**
 * Created by CCristi <ccovali@mitocgroup.com> on 12/10/15.
 */

'use strict';

export class Context {
  /**
   * @param {Object} options
   */
  constructor(options) {
    this._options = options;

    this._registerDataAsOptions();
  }

  /**
   * @returns {Object}
   */
  get options() {
    return this._options;
  }

  /**
   * @private
   */
  _registerDataAsOptions() {
    for (let key in this._options) {
      if (!this._options.hasOwnProperty(key)) {
        continue;
      }

      Object.defineProperty(this, key, {
        value: this._options[key],
        writable: false,
        configurable: false,
        enumerable: true,
      });
    }

    // Avoid _data key listing on Object.keys(request)
    Object.defineProperty(this, '_options', {
      configurable: false,
    });
  }

  /**
   * @param {String} option
   * @returns {boolean}
   */
  has(option) {
    return this._options.hasOwnProperty(option);
  }

  /**
   * @param {String} option
   * @param {*} defaultValue
   * @returns {*}
   */
  getOption(option, defaultValue = undefined) {
    return this._options.hasOwnProperty(option) ? this._options[option] : defaultValue;
  }
}
