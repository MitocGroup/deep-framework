/**
 * Created by AlexanderC on 6/10/15.
 */

'use strict';

/**
 * Response object
 */
export class Response {
  /**
   * @param {Request|*} request
   * @param {Object} data
   * @param {String} error
   */
  constructor(request, data, error) {
    this._request = request;

    this._rawError = error;
    this._rawData = data;

    this._statusCode = null;
    this._data = null;
    this._error = null;
  }

  /**
   * @returns {*}
   */
  get rawData() {
    return this._rawData;
  }

  /**
   * @returns {*}
   */
  get rawError() {
    return this._rawError;
  }

  /**
   * @returns {Request}
   */
  get request() {
    return this._request;
  }

  /**
   * @returns {Object}
   */
  get data() {
    return this._data;
  }

  /**
   * @returns {String}
   */
  get error() {
    return this._error;
  }

  /**
   * @returns {Boolean}
   */
  get isError() {
    return typeof this.error === 'string';
  }
}
