/**
 * Created by AlexanderC on 2/22/17.
 */

'use strict';

import {AbstractDriver} from './AbstractDriver';
import {UUID} from './Kinesis/UUID';

export class KinesisDriver extends AbstractDriver {
  /**
   * @param   {String}    kinesisEventStream
   * @param   {*} args
   */
  constructor(kinesisEventStream, ...args) {
    super(...args);

    this._partitionKey = null;
    this._kinesisEventStream = this._normalizeStreamName(kinesisEventStream);
    this._kinesis = new AWS.Kinesis(
      this._serviceOptionsFromStreamArn(kinesisEventStream)
    );
  }
  
  /**
   * @returns {AWS.Kinesis|*} 
   */
  get kinesis() {
    return this._kinesis;
  }

  /**
   * @returns {String}
   */
  get partitionKey() {
    this._partitionKey = this._partitionKey || UUID.generate();

    return this._partitionKey;
  }

  /**
   * @returns {String}
   */
  get kinesisEventStream() {
    return this._kinesisEventStream;
  }

  /**
   * @param {String} kinesisEventStream
   *
   * @returns {*}
   *
   * @private
   */
  _serviceOptionsFromStreamArn(kinesisEventStream) {
    const matches = kinesisEventStream
      .match(/^arn:aws:kinesis:([^:]+):([^:]+):stream\//i);
      
    if (!matches || matches.length < 3) {
      return {};
    }
    
    return {
      region: matches[1],
    };
  }

  /**
   * @param {String} kinesisEventStream
   *
   * @returns {String}
   *
   * @private
   */
  _normalizeStreamName(kinesisEventStream) {
    return kinesisEventStream.replace(/^.+\/([^\/]+)$/i, '$1');
  }

  /**
   * @param   {String} name
   * @param   {*} data
   * @param   {Object} context
   *
   * @returns {Promise|*}
   *
   * @private
   */
  _log(name, data, context) {
    return this._push([{name, data, context}]);
  }

  /**
   * @param   {Array} events
   *
   * @returns {Promise|*}
   *
   * @private
   */
  _push(events) {
    if (events.length <= 0) {
      return Promise.resolve();
    } else if (events.length > KinesisDriver.MAX_PUT_LENGTH) {
      return Promise.all(
        this
          ._chunks(events, KinesisDriver.MAX_PUT_LENGTH)
          .map(chunk => this._push(chunk))
      );
    }

    return new Promise((resolve, reject) => {
      const payload = {
        StreamName: this.kinesisEventStream,
        Records: events.map(event => {
          return {
            Data: JSON.stringify(event),
            PartitionKey: this.partitionKey,
          };
        }),
      };

      this.kinesis.putRecords(payload, (error, data) => {
        if (error) {
          return reject(error);
        }

        resolve(data);
      });
    });
  }

  /**
   * @param   {Array} arr
   * @param   {Number} pieces
   *
   * @returns {Array[]}
   *
   * @private
   */
  _chunks(arr, pieces) {
    const len = arr.length;

    let mid = len / pieces;
    let chunks = [];
    let start = 0;

    for (let i = 0; i < pieces; i++) {
      let last = start + mid;

      if (!len % pieces >= i) {
        last = last - 1;
      }

      chunks.push(arr.slice(start, last + 1) || []);

      start = last + 1;
    }

    return chunks;
  }

  /**
   * @see http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Kinesis.html#putRecord-property
   * 
   * @returns {String}
   */
  static get MAX_PUT_LENGTH() {
    return 500;
  }
}
