/**
 * Created by mgoria on 6/30/15.
 */

'use strict';

import {Exception} from './Exception';

/**
 * Thrown when auth error occurs
 */
export class AuthException extends Exception {
  /**
   * @param {Object} error
   */
  constructor(error) {
    super(`Error on authentication. ${error}`);
  }
}
