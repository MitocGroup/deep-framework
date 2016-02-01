/**
 * Created by mgoria on 1/19/16.
 */

'use strict';

import AWS from 'aws-sdk';
import {AbstractDriver} from './AbstractDriver';
import {FailedToSendSqsMessageException} from './Exception/FailedToSendSqsMessageException';
import {FailedToSendBatchSqsMessageException} from './Exception/FailedToSendBatchSqsMessageException';
import {InvalidSqsQueueUrlException} from './Exception/InvalidSqsQueueUrlException';
import {RumEventValidationException} from './Exception/RumEventValidationException';
//import {AbstractEvent} from './RUM/AbstractEvent';
import {FrameworkEvent} from './RUM/FrameworkEvent';

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

    //let event = AbstractEvent.create(this._kernel, message); // @todo - why it doesn't work ?
    let event = new FrameworkEvent(this.kernel, message);

    // @todo - check message size, max is 256 KB (262,144 bytes)
    if (!event.isValid()) {
      callback(new RumEventValidationException(event.eventLevel, event.validationError), null);
      return;
    }

    if (this.kernel.isBackend) {
      if (this._messagesBatch.length < RumSqsDriver.BATCH_SIZE) {
        this._messagesBatch.push(event);
      }

      if (this._messagesBatch.length === RumSqsDriver.BATCH_SIZE) {
        this.flush(callback);
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
    if (!this.enabled || this._messagesBatch.length === 0) {
      callback(null, null);
      return;
    }

    this._sendMessageBatch(this._messagesBatch, (error, data) => {
      this._messagesBatch = [];
      callback(error, data);
    });
  }

  /**
   * @param {AbstractEvent} event
   * @param callback
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
   * @param callback
   * @private
   */
  _sendMessageBatch(messages, callback) {
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
      if (error) {
        error = new FailedToSendBatchSqsMessageException(params.QueueUrl, error);
      }

      callback(error, data);
    });
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
}
