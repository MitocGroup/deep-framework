/**
 * Created by mgoria on 03/03/16.
 */

'use strict';

import {LogDriverException} from './LogDriverException';

/**
 * Thrown when failed to delete sqs messages
 */
export class FailedToDeleteSqsMessagesException extends LogDriverException {
  /**
   * @param {String} sqsQueueUrl
   * @param {Object} error
   */
  constructor(sqsQueueUrl, error) {
    super(`Failed to delete batch messages from "${sqsQueueUrl}" SQS queue. ${error}`);
  }
}
