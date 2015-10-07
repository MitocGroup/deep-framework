/**
 * Created by AlexanderC on 6/12/15.
 */

'use strict';

import {Exception} from '../../../Exception/Exception';

/**
 * Thrown when ARN is invalid
 */
export class InvalidArnException extends Exception {
  /**
   * @param {String} arn
   */
  constructor(arn) {
    super(`Invalid arn string "${arn}".`);
  }
}

