/**
 * Created by AlexanderC on 6/10/15.
 */

'use strict';

/**
 * Response object
 */
export class Response {
  /**
   * @param {Request|*} request
   * @param {Object} data
   * @param {String} error
   */
  constructor(request, data, error) {
    this._request = request;

    this._rawError = error;
    this._rawData = data;

    if (this._rawError) {
      this._rawError = Response._toErrorObj(this._rawError);
    }

    this._statusCode = null;
    this._data = null;
    this._error = null;
    this._headers = null;
    this._requestId = null;
  }

  /**
   * @returns {String}
   */
  static get ORIGINAL_REQUEST_ID_HEADER() {
    return 'x-amzn-original-RequestId';
  }

  /**
   * @returns {String}
   */
  static get REQUEST_ID_HEADER() {
    return 'x-amzn-RequestId';
  }

  /**
   * @returns {*}
   */
  get rawData() {
    return this._rawData;
  }

  /**
   * @returns {*}
   */
  get rawError() {
    return this._rawError;
  }

  /**
   * @returns {Request}
   */
  get request() {
    return this._request;
  }

  /**
   * @returns {Object}
   */
  get data() {
    return this._data;
  }

  /**
   * @returns {Number}
   */
  get statusCode() {
    return this._statusCode;
  }

  /**
   * @returns {Error}
   */
  get error() {
    return this._error;
  }

  /**
   * @returns {String}
   */
  get requestId() {
    return this._requestId;
  }

  /**
   * @returns {Object|null}
   */
  get headers() {
    return this._headers;
  }

  /**
   * @returns {Boolean}
   */
  get isError() {
    return !!this.error;
  }

  /**
   * @param {String|Error|*} rawError
   * @returns {Error}
   * @private
   */
  static _toErrorObj(rawError) {
    return rawError instanceof Error
      ? rawError
      : new Error(rawError.toString());
  }

  /**
   * @returns {{requestId: String, statusCode: Number, headers: (Object|null), data: Object, error: Error}}
   */
  toJSON() {
    return {
      requestId: this.requestId,
      statusCode: this.statusCode,
      headers: this.headers,
      data: this.data,
      error: this.error,
    }
  }
}
