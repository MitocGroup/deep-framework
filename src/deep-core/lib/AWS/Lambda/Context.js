/**
 * Created by CCristi <ccovali@mitocgroup.com> on 12/10/15.
 */

'use strict';

export class Context {
  /**
   * @param {Object} data
   */
  constructor(data) {
    this._data = data;

    this._registerDataAsOptions();
  }

  /**
   * @returns {Object}
   */
  get data() {
    return this._data;
  }

  /**
   * @private
   */
  _registerDataAsOptions() {
    for (let key in this._data) {
      if (!this._data.hasOwnProperty(key)) {
        continue;
      }

      Object.defineProperty(this, key, {
        value: this._data[key],
        writable: false,
        configurable: false,
        enumerable: true,
      });
    }

    // Avoid _data key listing on Object.keys(request)
    Object.defineProperty(this, '_data', {
      configurable: false,
    });
  }

  /**
   * @param {String} name
   * @returns {boolean}
   */
  has(name) {
    return this._data.hasOwnProperty(name);
  }

  /**
   * @param {String} name
   * @param {*} defaultValue
   * @returns {*}
   */
  getOption(name, defaultValue = undefined) {
    return this._data.hasOwnProperty(name) ? this._data[name] : defaultValue;
  }
}
