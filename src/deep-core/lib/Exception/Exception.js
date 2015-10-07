/**
 * Created by AlexanderC on 5/25/15.
 */

'use strict';

/**
 * Base exception
 */
export class Exception extends Error {
  /**
   * @param {String} message
   */
  constructor(message) {
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
  }

  /**
   * @returns {String}
   */
  get name() {
    return this.constructor.name;
  }
}
