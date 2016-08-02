/**
 * Created by AlexanderC on 6/10/15.
 */

'use strict';

import {Response} from './Response';
import {ValidationError} from './Exception/ValidationError';

/**
 * Response object
 */
export class LambdaResponse extends Response {
  /**
   * @param {*} args
   */
  constructor(...args) {
    super(...args);

    this._originalResponse = null;
    this._logResult = null;

    // assure calling the very first!
    this._fillStatusCode();

    let responsePayload = this._decodePayload();

    this._fillData(responsePayload);
    this._fillError(responsePayload);
  }

  /**
   * @param {AWS.Response|null} response
   */
  set originalResponse(response) {
    this._originalResponse = response;
  }

  /**
   *
   * @returns {AWS.Response|null}
   */
  get originalResponse() {
    return this._originalResponse;
  }

  /**
   * @returns {Object}
   */
  get headers() {
    if (!this._headers && this.originalResponse) {
      this._headers = this.originalResponse.httpResponse ? this.originalResponse.httpResponse.headers : {};
    }

    return this._headers;
  }

  /**
   * @returns {String|null}
   */
  get requestId() {
    if (!this._requestId && this.headers) {
      if (this.headers[Response.REQUEST_ID_HEADER.toLowerCase()]) {
        this._requestId = this.headers[Response.REQUEST_ID_HEADER.toLowerCase()];
      }
    }

    return this._requestId;
  }

  /**
   * @param {Object|null} responsePayload
   * @private
   */
  _fillData(responsePayload) {
    if (responsePayload &&
      !this._request.async &&
      !responsePayload.hasOwnProperty('errorMessage')) {

      this._data = responsePayload;
    }
  }

  /**
   * @param {Object|null} responsePayload
   * @private
   */
  _fillError(responsePayload) {
    if (this._rawError) {
      this._error = this._rawError;
    } else if (!this._request.async) {
      if (responsePayload && responsePayload.hasOwnProperty('errorMessage')) {
        this._error = LambdaResponse.getPayloadError(responsePayload);
      }
    } else if (this._statusCode !== 202) { // check for failed async invocation
      this._error = new Error('Unknown async invocation error');
    }
  }

  /**
   * @private
   */
  _fillStatusCode() {
    if (this._rawData) {
      this._statusCode = parseInt(this._rawData.StatusCode || this._rawData.Status);
    } else {
      this._statusCode = 500;
    }
  }

  /**
   * @returns {Object|null}
   * @private
   */
  _decodePayload() {
    let decodedPayload = null;

    if (this._rawData) {
      if (this._rawData.Payload) {
        decodedPayload = LambdaResponse._decodePayloadObject(this._rawData.Payload);

        // treat the case when error is stored in payload (nested)
        if (decodedPayload && decodedPayload.hasOwnProperty('errorMessage')) {
          decodedPayload = LambdaResponse._decodeRawErrorObject(decodedPayload.errorMessage);
        }
      } else if (this._rawData.errorMessage) {
        decodedPayload = LambdaResponse._decodeRawErrorObject(this._rawData.errorMessage);
      }
    }

    return decodedPayload;
  }

  /**
   * @param {String|Object|*} rawError
   * @returns {Object|String|null}
   * @private
   */
  static _decodeRawErrorObject(rawError) {
    let errorObj = rawError;

    if (typeof errorObj === 'string') {
      try {
        errorObj = JSON.parse(errorObj);
      } catch(e) {
        errorObj = {
          errorMessage: errorObj, // assume errorObj is the error message
          errorStack: (new Error('Unknown error occurred.')).stack,
          errorType: 'UnknownError',
        };
      }
    } else {
      errorObj = errorObj || {
        errorMessage: 'Unknown error occurred.',
        errorStack: (new Error('Unknown error occurred.')).stack,
        errorType: 'UnknownError',
      };
    }

    return errorObj;
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
   * @param {String} rawPayload
   * @returns {Object|String|null}
   * @private
   */
  static _decodePayloadObject(rawPayload) {
    let payload = rawPayload;

    if (typeof rawPayload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch(e) {
        console.debug('Unable to parse: ', e);
      }
    }

    return payload;
  }

  /**
   * @param {Object} payload
   * @returns {Error|ValidationError|null}
   */
  static getPayloadError(payload) {
    if (payload.hasOwnProperty('errorMessage')) {
      let error = null;

      if (LambdaResponse.isValidationError(payload)) {
        error = new ValidationError(payload.errorMessage, payload.validationErrors);
      } else {
        payload.errorType = payload.errorType || 'UnknownError';
        payload.errorMessage = payload.errorMessage || 'Unknown error occurred.';
        payload.errorStack = payload.errorStack || (new Error(payload.errorMessage)).stack;

        error = new Error(payload.errorMessage);

        // try to define a custom constructor name
        // fail silently in case of readonly property...
        try {
          Object.defineProperty(error, 'name', {
            value: payload.errorType,
          });
        } catch (e) {
          console.debug('Unable to define property: ', e);
        }
      }

      try {
        Object.defineProperty(error, 'stack', {
          value: payload.errorStack,
        });
      } catch (e) {
        console.debug('Unable to define property: ', e);
      }

      return error;
    }

    return null;
  }

  /**
   * @param {Object} payload
   * @returns {Boolean}
   */
  static isValidationError(payload) {
    return payload.hasOwnProperty('errorType') &&
      payload.hasOwnProperty('errorMessage') &&
      payload.hasOwnProperty('validationErrors') &&
      payload.errorType === LambdaResponse.VALIDATION_ERROR_TYPE;
  }

  /**
   * @returns {String}
   */
  static get VALIDATION_ERROR_TYPE() {
    return 'ValidationError';
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
