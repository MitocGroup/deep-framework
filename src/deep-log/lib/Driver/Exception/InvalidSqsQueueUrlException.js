/**
 * Created by mgoria on 1/21/16.
 */

'use strict';

import {LogDriverException} from './LogDriverException';

/**
 * Thrown when SQS queue url is invalid
 */
export class InvalidSqsQueueUrlException extends LogDriverException {
  /**
   * @param {String} sqsQueueUrl
   * @param {Object|String} error
   */
  constructor(sqsQueueUrl, error) {
    super(`Invalid SQS queue url "${sqsQueueUrl}". ${error}`);
  }
}
