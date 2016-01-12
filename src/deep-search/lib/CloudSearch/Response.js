/**
 * Created by AlexanderC on 1/12/16.
 */

'use strict';

export class Response {
  /**
   * @param {Error|null} error
   * @param {Object} data
   */
  constructor(error, data) {
    this._error = error;

    this._requestId = null;
    this._executionTime = null;


    if (data) {
      this._parseRawData(data);
    }
  }

  /**
   * @returns {String}
   */
  get requestId() {
    return this._requestId;
  }

  /**
   * @returns {Number}
   */
  get executionTime() {
    return this._executionTime;
  }

  /**
   * @returns {Error|null}
   */
  get error() {
    return this._error;
  }

  /**
   * @returns {Boolean}
   */
  get isError() {
    return !!this._error;
  }

  /**
   * @param {Object} data
   * @private
   */
  _parseRawData(data) {
    this._requestId = data.status.rid;
    this._executionTime = data.status.timems;
  }
}