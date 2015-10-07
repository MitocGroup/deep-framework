/**
 * Created by AlexanderC on 6/10/15.
 */

'use strict';

import {Response} from './Response';

/**
 * Response object
 */
export class LambdaResponse extends Response {
  /**
   * @param {Request} request
   * @param {Object} data
   * @param {String} error
   */
  constructor(request, data, error) {
    super(...arguments);

    this._errorType = null;
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
  get errorType() {
    if (this._errorType) {
      return this._errorType;
    }

    if (this._rawError) {
      this._errorType = (this._rawError && this._rawError.name) ? this._rawError.name : 'Error';
    } else {
      var response = JSON.parse(this._rawData.Payload);
      if (response && typeof response.errorType !== 'undefined') {
        this._errorType = response.errorType;
      } else {
        this._errorType = 'Error';
      }
    }

    return this._errorType;
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
