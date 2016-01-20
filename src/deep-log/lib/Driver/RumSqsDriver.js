/**
 * Created by mgoria on 1/19/16.
 */

'use strict';

import AWS from 'aws-sdk';
import {AbstractDriver} from './AbstractDriver';
import {FailedToSendSqsMessageException} from './Exception/FailedToSendSqsMessageException'

/**
 * SQS logging driver
 */
export class RumSqsDriver extends AbstractDriver {
  /**
   * @param {String} queueUrl
   * @param {Boolean} enabled
   */
  constructor(queueUrl, enabled = false) {
    this._queueUrl = queueUrl;
    this._enabled = enabled;

    this._sqs = new AWS.SQS();
  }

  /**
   * @returns {String}
   */
  get queueUrl() {
    return this._queueUrl;
  }

  /**
   * @returns {Boolean}
   */
  get enabled() {
    return this._enabled;
  }

  /**
   * @param {Object} event
   */
  log(event, callback) {
    if (!this.enabled) {
      callback(null, null);
      return;
    }

    // @todo - validate event object and add context related stuff (userId, requestId, sessionId, etc)

    //@todo - send batch messages in backend context
    this._sendMessage(event, callback);
  }

  /**
   * @param {String} message
   * @param callback
   * @private
   */
  _sendMessage(message, callback) {
    let params = {
      MessageBody: this._stringifyMessage(message),
      QueueUrl: this.queueUrl,
    };

    this._sqs.sendMessage(params, (error, data) => {
      if (error) {
        error = new FailedToSendSqsMessageException(params.QueueUrl, params.QueueUrl, error);
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
    messages.forEach((message, index) => {
      message = this._stringifyMessage(message);
      let id = `${AbstractDriver._md5(message)}-${new Date().getTime()}-${index}`;

      entries.push({
        Id: id,
        MessageBody: message,
      });
    });

    var params = {
      QueueUrl: this.queueUrl,
      Entries: entries
    };

    this._sqs.sendMessageBatch(params, (error, data) => {
      if (error) {
        error = new FailedToSendBatchSqsMessageException(params.QueueUrl, params.QueueUrl, error);
      }

      callback(error, data);
    });
  }

  /**
   * @param {String} message
   * @private
   */
  _stringifyMessage(message) {
    return message && typeof message === 'object' ? JSON.stringify(message) : message;
  }
}
