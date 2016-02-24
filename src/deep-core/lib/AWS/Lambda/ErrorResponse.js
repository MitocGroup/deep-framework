/**
 * Created by AlexanderC on 5/25/15.
 */

'use strict';

import {Response} from './Response';

/**
 * Error response sent to the lambda context
 */
export class ErrorResponse extends Response {
  /**
   * @param {Runtime} runtime
   * @param {Error|String|*} error
   */
  constructor(runtime, error) {
    super(runtime, ErrorResponse.createErrorObject(error));
  }

  /**
   * @returns {String}
   */
  static get STATUS_CODE_KEY() {
    return '_deep_http_status_code_';
  }

  /**
   * @param {Error|String|*} error
   * @returns {Object}
   */
  static createErrorObject(error) {
    let errorObj = {};
    let errorCode = 500; // default error code

    if (error.name === 'ValidationError') { // we assume it's a joi validation error
      errorCode = 400;
      errorObj = {
        errorType: error.name,
        errorMessage: error.annotate(),
        errorStack: error.stack || (new Error(error.message)).stack,
        validationErrors: error.details,
      };
    } else if (error instanceof Error) {
      errorObj = {
        errorType: error.name,
        errorMessage: error.message,
        errorStack: error.stack || (new Error(error.message)).stack,
      };
    } else {
      let plainError = (error || 'Unexpected error occurred.').toString();

      errorObj = {
        errorType: 'Error',
        errorMessage: plainError,
        errorStack: (new Error(plainError)).stack,
      };
    }

    // @todo - check if error.code is defined into status codes mapping, if not fallback to a defined one
    // e.g. 223 -> 200, 306 -> 300, etc
    errorObj[ErrorResponse.STATUS_CODE_KEY] = error.code || errorCode;

    return errorObj;
  }

  /**
   *
   * @returns {Object}
   * @private
   */
  get data() {
    return JSON.stringify(this._data);
  }

  /**
   * @returns {String}
   */
  static get contextMethod() {
    return 'fail';
  }
}
