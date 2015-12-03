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
    this._logResult = null;
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
   * @returns {String}
   */
  get logResult() {
    if (this._logResult) {
      return this._logResult;
    }

    if (this._rawData && this._rawData.hasOwnProperty('LogResult')) {
      this._logResult = this._decodeBase64(this._rawData.LogResult);
    }

    return this._logResult;
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

  /**
   * @param {String} str
   * @returns {String}
   * @private
   */
  _decodeBase64(str) {
    if (typeof Buffer !== 'undefined') {
      str = new Buffer(str, 'base64').toString('utf8');
    } else if (typeof atob !== 'undefined') {
      str = atob(str);
    }

    return str;
  }
}
