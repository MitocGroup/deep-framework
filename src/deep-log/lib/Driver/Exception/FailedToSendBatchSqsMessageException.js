/**
 * Created by mgoria on 1/20/16.
 */

'use strict';

import {LogDriverException} from './LogDriverException';

/**
 * Thrown when failed to send sqs message
 */
export class FailedToSendBatchSqsMessageException extends LogDriverException {
  /**
   * @param {String} sqsQueueUrl
   * @param {Object} error
   */
  constructor(sqsQueueUrl, error) {
    super(`Failed to send batch messages to ${sqsQueueUrl} SQS queue. ${error}`);
  }
}
