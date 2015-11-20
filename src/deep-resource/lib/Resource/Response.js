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
    if (this._data) {
      return this._data;
    }

    if (this._rawData) {
      var response = JSON.parse(this._rawData.Payload);
      if (response && typeof response.errorMessage === 'undefined') {
        this._data = response;
      }
    }

    return this._data;
  }

  /**
   * @returns {Boolean}
   */
  get isError() {
    return typeof this.error === 'string';
  }

  /**
   * @returns {String}
   */
  get error() {
    if (this._error) {
      return this._error;
    }

    if (this._rawError) {
      this._error = this._rawError;
    } else {
      var response = JSON.parse(this._rawData.Payload);
      if (response && typeof response.errorMessage !== 'undefined') {
        this._error = response.errorMessage;
      }
    }

    return this._error;
  }

  /**
   * @returns {String}
   */
  get statusCode() {
    if (this._statusCode) {
      return this._statusCode;
    }

    if (this._rawData) {
      this._statusCode = this._rawData.StatusCode;
    }

    return this._statusCode;
  }
}
