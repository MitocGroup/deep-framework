/**
 * Created by AlexanderC on 6/10/15.
 */

'use strict';

import {Exception} from './Exception';

/**
 * Thrown when requested service is missing
 */
export class MissingServiceException extends Exception {
  /**
   * @param {String} serviceName
   */
  constructor(serviceName) {
    super(`Missing service ${serviceName} in deep-kernel`);
  }
}
