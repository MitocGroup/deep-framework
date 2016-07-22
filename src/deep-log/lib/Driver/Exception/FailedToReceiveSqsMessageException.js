/**
 * Created by mgoria on 03/03/16.
 */

'use strict';

import {LogDriverException} from './LogDriverException';

/**
 * Thrown when failed to receive sqs messages
 */
export class FailedToReceiveSqsMessageException extends LogDriverException {
  /**
   * @param {String} sqsQueueUrl
   * @param {Object} error
   */
  constructor(sqsQueueUrl, error) {
    super(`Failed to receive messages from "${sqsQueueUrl}" SQS queue. ${error}`);
  }
}
