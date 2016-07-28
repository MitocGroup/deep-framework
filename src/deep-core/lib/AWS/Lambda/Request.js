/**
 * Created by AlexanderC on 5/25/15.
 */

/*eslint no-undefined: 0*/

'use strict';

import qs from 'qs';

/**
 * Request received by the lambda context
 */
export class Request {
  /**
   * @param {*} data
   */
  constructor(data = {}) {
    this._data = !Array.isArray(data) ? qs.parse(data) : data;

    this._registerDataAsParams();
  }

  /**
   * @private
   */
  _registerDataAsParams() {
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
   * @returns {*}
   */
  get data() {
    return this._data;
  }

  /**
   * @param {String} name
   * @param {String|Object|null} defaultValue
   *
   * @returns {String|Object|null}
   */
  getParam(name, defaultValue = undefined) {
    return this._data.hasOwnProperty(name) ? this._data[name] : defaultValue;
  }
}
