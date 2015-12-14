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

    if (this._rawError) {
      this._rawError = Response._toErrorObj(this._rawError);
    }

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
   * @returns {Number}
   */
  get statusCode() {
    return this._statusCode;
  }

  /**
   * @returns {Error}
   */
  get error() {
    return this._error;
  }

  /**
   * @returns {Boolean}
   */
  get isError() {
    return !!this.error;
  }

  /**
   * @param {String|Error|*} rawError
   * @returns {Error}
   * @private
   */
  static _toErrorObj(rawError) {
    if (typeof rawError === 'object' && rawError instanceof Error) {
      return rawError;
    }

    return new Error(rawError.toString());
  }
}
