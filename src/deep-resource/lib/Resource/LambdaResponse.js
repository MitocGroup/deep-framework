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

    // assure calling the very first!
    this._fillStatusCode();

    let responsePayload = this._decodePayload();

    this._fillData(responsePayload);
    this._fillError(responsePayload);
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
      if (!responsePayload) {
        this._error = new Error('There is no error nor payload in Lambda response');
      } else if (responsePayload.hasOwnProperty('errorMessage')) {
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
    if (this._rawData.hasOwnProperty('Payload')) {
      let payload = this._rawData.Payload;

      if (typeof payload === 'string') {
        try {
          payload = JSON.parse(payload);
        } catch(e) {}
      }

      return payload;
    } else if(this._rawData.hasOwnProperty('errorMessage')) {
      let errorObj = this._rawData.errorMessage;

      if (typeof errorObj === 'string') {
        try {
          errorObj = JSON.parse(errorObj);
        } catch(e) {}
      } else {
        errorObj = errorObj || {
            errorMessage: 'Unknown error occurred.',
            errorStack: (new Error('Unknown error occurred.')).stack,
            errorType: 'UnknownError',
          };
      }

      return errorObj;
    }

    return null;
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
        } catch (e) {   }
      }

      try {
        Object.defineProperty(error, 'stack', {
          value: payload.errorStack,
        });
      } catch (e) {   }

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
}
