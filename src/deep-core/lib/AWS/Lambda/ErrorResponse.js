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
   * @param {Error|String|*} error
   * @returns {Object}
   */
  static createErrorObject(error) {
    let errorObj = {};

    if (typeof error === 'object' && error instanceof Error) {
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
