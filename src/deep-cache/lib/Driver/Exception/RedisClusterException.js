/**
 * Created by AlexanderC on 6/16/15.
 */

'use strict';

import {Exception} from './Exception';

/**
 * Thrown when redis cluster returned an error
 */
export class RedisClusterException extends Exception {
  /**
   * @param {String} error
   */
  constructor(error) {
    let originalException = error instanceof Error ? error : null;
    let errorPlain = originalException !== null ? originalException.message : error.toString();

    super(`Redis cluster operation failed: ${errorPlain}`);

    this._originalException = originalException;
  }

  /**
   * @returns {Error}
   */
  get originalException() {
    return this._originalException;
  }
}
