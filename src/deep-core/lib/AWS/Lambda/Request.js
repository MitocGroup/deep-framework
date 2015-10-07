/**
 * Created by AlexanderC on 5/25/15.
 */

'use strict';

/**
 * Request received by the lambda context
 */
export class Request {
  /**
   * @param {*} data
   */
  constructor(data) {
    this._data = data || {};
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
  getParam(name, defaultValue = null) {
    return this.data.hasOwnProperty(name) ? this.data[name] : defaultValue;
  }
}
