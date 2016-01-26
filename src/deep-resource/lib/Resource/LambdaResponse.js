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
    if (this._rawData && this._rawData.hasOwnProperty('Payload')) {
      let payload = this._rawData.Payload;

      if (typeof payload === 'string') {
        try {
          payload = JSON.parse(payload);
        } catch(e) {}
      }

      return payload;
    }

    return null;
  }

  /**
   * @param {Object} payload
   * @returns {Error|ValidationError|null}
   */
  static getPayloadError(payload) {
    if (LambdaResponse.isValidationError(payload)) {
      return new ValidationError(payload.errorMessage, payload.validationErrors);
    } else if (payload.errorMessage) {

      // check for error object (on context.failed called)
      if (!payload.hasOwnProperty('errorType') &&
        !payload.hasOwnProperty('errorStack')) {

        let rawErrorObj = null;

        try {
          rawErrorObj = JSON.parse(payload.errorMessage);
          rawErrorObj = rawErrorObj || {
              errorMessage: 'Unknown error occurred.',
              errorStack: null,
              errorType: 'UnknownError',
            };

          rawErrorObj.errorMessage = rawErrorObj.errorMessage || 'Unknown error occurred.';
          rawErrorObj.errorType = rawErrorObj.errorType || 'UnknownError';
        } catch (e) {
        }

        payload = rawErrorObj || {
            errorMessage: payload.errorMessage,
            errorStack: null,
            errorType: 'UnknownError',
          };
      } else {
        payload.errorType = payload.errorType || 'UnknownError';
      }

      let errorObj = new Error(payload.errorMessage);

      // try to define a custom constructor name
      // fail silently in case of readonly property...
      try {
        Object.defineProperty(errorObj, 'name', {
          value: payload.errorType,
        });
      } catch (e) {   }

      Object.defineProperty(errorObj, 'stack', {
        value: payload.errorStack,
      });

      return errorObj;
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
