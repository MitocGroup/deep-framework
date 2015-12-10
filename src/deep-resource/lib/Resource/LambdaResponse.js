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

    // pre populate data, error, etc when instance is created
    this._data = this.data;
    this._error = this.error;
    this._errorType = this.errorType;
    this._statusCode = this.statusCode;
  }

  /**
   * @returns {Object}
   */
  get data() {
    if (this._data) {
      return this._data;
    }

    if (this._rawData && !this._request.async) {
      let response = this._getPayload();

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
      if (!this._request.async) {
        let response = this._getPayload();

        if (response && typeof response.errorMessage !== 'undefined') {
          this._error = response.errorMessage;
        }
      } else {
        this._error = 'Unknown async invocation error';
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
      if (!this._request.async) {
        let response = this._getPayload();

        if (response && typeof response.errorType !== 'undefined') {
          this._errorType = response.errorType;
        } else {
          this._errorType = 'Error';
        }
      } else {
        this._errorType = 'AsyncInvocationError';
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
      this._statusCode = this._rawData.StatusCode || this._rawData.Status;
    }

    return this._statusCode;
  }

  /**
   * @returns {Object|null}
   * @private
   */
  _getPayload() {
    if (typeof this._rawData === 'object' &&
      this._rawData.hasOwnProperty('Payload')) {
      let payload = this._rawData.Payload;

      return typeof payload === 'string' ? JSON.parse(payload) : payload;
    }

    return null;
  }
}
