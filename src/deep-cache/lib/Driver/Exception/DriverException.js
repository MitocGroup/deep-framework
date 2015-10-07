/**
 * Created by AlexanderC on 6/16/15.
 */

'use strict';

import {Exception} from './Exception';

/**
 * Base exception
 */
export class DriverException extends Exception {
  /**
   * @param {Error} originalException
   */
  constructor(originalException) {
    super(originalException);

    this._originalException = originalException instanceof Error ? originalException : new Error(originalException);
  }

  /**
   * @returns {Error}
   */
  get originalException() {
    return this._originalException;
  }
}
