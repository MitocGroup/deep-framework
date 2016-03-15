/**
 * Created by AlexanderC on 5/25/15.
 */

'use strict';

/**
 * Base exception
 */
export class Exception extends Error {
  /**
   * @returns {String}
   */
  static get CODE_KEY() {
    return '_deep_error_code_';
  }

  /**
   * @returns {Number}
   */
  static get DEFAULT_CODE() {
    return 400;
  }

  /**
   * @param {String} message
   * @param {Number} code
   */
  constructor(message, code = null) {
    super();

    if (Error.hasOwnProperty('captureStackTrace')) {
      Error.captureStackTrace(this, this.constructor);
    } else {
      Object.defineProperty(this, 'stack', {
        value: (new Error()).stack,
      });
    }

    Object.defineProperty(this, 'message', {
      value: message,
    });

    // It's used to map error codes to API Gateway http status codes
    this._code = code;
  }

  /**
   * @returns {String}
   */
  get name() {
    return this.constructor.name;
  }

  /**
   * @param {Number} code
   */
  set code(code) {
    this._code = code;
  }

  /**
   * @returns {Number}
   */
  get code() {
    return this._code;
  }
}
