/**
 * Created by mgoria on 1/20/16.
 */

'use strict';

import {LogDriverException} from './LogDriverException';

/**
 * Thrown when failed to send sqs message
 */
export class FailedToSendSqsMessageException extends LogDriverException {
  /**
   * @param {String} sqsQueueUrl
   * @param {String} message
   * @param {Object} error
   */
  constructor(sqsQueueUrl, message, error) {
    super(`Failed to send "${message}" message to ${sqsQueueUrl} SQS queue. ${error}`);
  }
}
