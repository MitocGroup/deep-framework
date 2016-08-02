/**
 * Created by mgoria on 1/19/16.
 */

'use strict';

import AWS from 'aws-sdk';
import {AbstractDriver} from './AbstractDriver';
import {FailedToSendSqsMessageException} from './Exception/FailedToSendSqsMessageException';
import {FailedToSendBatchSqsMessageException} from './Exception/FailedToSendBatchSqsMessageException';
import {FailedToReceiveSqsMessageException} from './Exception/FailedToReceiveSqsMessageException';
import {FailedToDeleteSqsMessagesException} from './Exception/FailedToDeleteSqsMessagesException';
import {InvalidSqsQueueUrlException} from './Exception/InvalidSqsQueueUrlException';
import {RumEventValidationException} from './Exception/RumEventValidationException';
import {EventFactory} from './RUM/EventFactory';

/**
 * SQS logging driver
 */
export class RumSqsDriver extends AbstractDriver {
  /**
   * @param {String} queueUrl
   * @param {Object} kernel
   * @param {Boolean} enabled
   */
  constructor(queueUrl, kernel, enabled = false) {
    super();

    this._queueUrl = queueUrl;
    this._kernel = kernel;
    this._enabled = enabled;

    this._messagesBatch = [];
    this._runningBatches = 0;
    this._sqs = null;
  }

  /**
   * @returns {Number}
   */
  static get BATCH_SIZE() {
    return 10;
  }

  /**
   * @returns {String}
   */
  get queueUrl() {
    return this._queueUrl;
  }

  /**
   * @returns {Object}
   */
  get kernel() {
    return this._kernel;
  }

  /**
   * @returns {Boolean}
   */
  get enabled() {
    return this._enabled;
  }

  /**
   * @returns {AWS.SQS}
   */
  get sqs() {
    if (!this._sqs) {
      this._sqs = new AWS.SQS({
        region: RumSqsDriver.getRegionFromSqsQueueUrl(this.queueUrl)
      });
    }

    return this._sqs;
  }

  /**
   * @param {Object} message
   * @param {Function} callback
   */
  log(message, callback) {
    if (!this.enabled) {
      callback(null, null);
      return;
    }

    let event = EventFactory.create(this.kernel, message);

    // @todo - check message size, max is 256 KB (262,144 bytes)
    if (!event.isValid()) {
      callback(new RumEventValidationException(event.getEventLevel(), event.validationError), null);
      return;
    }

    if (this.kernel.isBackend) {
      if (this._messagesBatch.length < RumSqsDriver.BATCH_SIZE) {
        this._messagesBatch.push(event);
      }

      if (this._messagesBatch.length === RumSqsDriver.BATCH_SIZE) {
        let batch = this._messagesBatch.slice();
        this._messagesBatch = [];

        this._sendMessageBatch(batch, callback);
      } else {
        callback(null, null);
      }
    } else {
      this._sendMessage(event, callback);
    }
  }

  /**
   * @param {Function} callback
   */
  flush(callback) {
    if (!this.enabled || (this._messagesBatch.length === 0 && this._runningBatches === 0)) {
      callback(null, null);
      return;
    }

    this._sendMessageBatch(this._messagesBatch, (error, data) => {
      this._messagesBatch = [];

      if (this._runningBatches > 0) {
        // wait for all batches to be pushed into SQS
        var intervalID = setInterval(() => {
          if (this._runningBatches === 0) {
            clearInterval(intervalID);
            return callback(error, data);
          }
        }, 50);
      } else {
        callback(error, data);
      }
    });
  }

  /**
   * @param {AbstractEvent} event
   * @param {Function} callback
   * @private
   */
  _sendMessage(event, callback) {
    let params = {
      MessageBody: JSON.stringify(event),
      QueueUrl: this.queueUrl,
    };

    this.sqs.sendMessage(params, (error, data) => {
      if (error) {
        error = new FailedToSendSqsMessageException(params.QueueUrl, params.MessageBody, error);
      }

      callback(error, data);
    });
  }

  /**
   * @param {Array} messages
   * @param {Function} callback
   * @private
   */
  _sendMessageBatch(messages, callback) {
    if (messages.length === 0) {
      callback(null, null);
      return;
    }

    this._runningBatches++;

    let entries = [];
    messages.forEach((event, index) => {
      event = JSON.stringify(event);
      let id = `${AbstractDriver._md5(event)}-${new Date().getTime()}-${index}`;

      entries.push({
        Id: id,
        MessageBody: event,
      });
    });

    var params = {
      QueueUrl: this.queueUrl,
      Entries: entries
    };

    this.sqs.sendMessageBatch(params, (error, data) => {
      this._runningBatches--;

      if (error) {
        error = new FailedToSendBatchSqsMessageException(params.QueueUrl, error);
      }

      callback(error, data);
    });
  }

  /**
   * @param {Function} callback
   */
  receiveMessages(callback) {
    let params = {
      QueueUrl: this.queueUrl,
      MaxNumberOfMessages: 10,
      VisibilityTimeout: 20,
      WaitTimeSeconds: 0
    };

    this.sqs.receiveMessage(params, (error, data) => {
      if (error) {
        error = new FailedToReceiveSqsMessageException(params.QueueUrl, error);
      }

      callback(error, data);
    });
  }

  /**
   * @param {Array} messages
   * @param {Function} callback
   */
  deleteMessages(messages, callback) {
    if (messages.length === 0) {
      callback(null, null);
      return;
    }

    let params = {
      QueueUrl: this.queueUrl,
      Entries: []
    };

    messages.forEach((message) => {
      params.Entries.push({
        Id: message.MessageId,
        ReceiptHandle: message.ReceiptHandle
      });
    });

    this.sqs.deleteMessageBatch(params, (error, data) => {
      if (error) {
        error = new FailedToDeleteSqsMessagesException(params.QueueUrl, error);
      }

      callback(error, data);
    });
  }

  /**
   * @param {Function} callback
   * @param {Object[]} additionalAttributes
   */
  getQueueAttributes(callback, additionalAttributes = []) {
    let defaultAttributes = [
      'ApproximateNumberOfMessages',
      'ApproximateNumberOfMessagesNotVisible',
      'ApproximateNumberOfMessagesDelayed'
    ];

    let attributes = defaultAttributes.concat(
      additionalAttributes.filter(attr => defaultAttributes.indexOf(attr) === -1)
    );

    let params = {
      QueueUrl: this.queueUrl,
      AttributeNames: attributes
    };

    this.sqs.getQueueAttributes(params, callback);
  }

  /**
   * @param {String} queueUrl
   * @returns {String}
   */
  static getRegionFromSqsQueueUrl(queueUrl) {
    let regionParts = queueUrl.match(/\.([^\.]+)\.amazonaws\.com\/.*/i);

    if (!regionParts || regionParts.length === 0) {
      throw new InvalidSqsQueueUrlException(queueUrl, 'Unable to extract AWS region.');
    }

    return regionParts[1];
  }

  /**
   * @returns {String}
   */
  static get ES_LOGS_INDEX() {
    return 'rum';
  }

  /**
   * @returns {String}
   */
  static get ES_LOGS_TYPE() {
    return 'logs';
  }
}
