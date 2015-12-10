/**
 * Created by AlexanderC on 6/10/15.
 */

'use strict';

import {Response} from './Response';

export class SuperagentResponse extends Response {
  /**
   * @param {Request} request
   * @param {Object} data
   * @param {String} error
   */
  constructor(request, data, error) {
    super(...arguments);

    this._populateData(data);
    this._populateError(data, error, request.isLambda);
    this._populateStatusCode(data);
  }

  /**
   * @param {Object} data
   * @private
   */
  _populateData(data) {
    this._data = data && data.body ? data.body : null;
  }

  /**
   * @param {Object} data
   * @param {Object} error
   * @param {Boolean} isLambda
   * @private
   */
  _populateError(data, error, isLambda) {
    if (error) {
      this._error = error;
    } else if (data) {
      if (isLambda) {
        this._error = data.body && data.body.errorMessage ? data.body.errorMessage : null;
      } else {
        this._error = data.error || null;
      }
    } else {
      this._error = 'Unexpected error occurred';
    }
  }

  /**
   * @param {Object} data
   * @private
   */
  _populateStatusCode(data) {
    this._statusCode = data && data.status ? data.status : 500;
  }

  /**
   * @returns {Object}
   */
  get data() {
    return this._data;
  }

  /**
   * @returns {Boolean}
   */
  get isError() {
    return !!this._error;
  }

  /**
   * @returns {String}
   */
  get error() {
    return this._error;
  }

  /**
   * @returns {String}
   */
  get statusCode() {
    return this._statusCode;
  }
}
