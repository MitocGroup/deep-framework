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

    this._data = this._parseResponse(data);
    this._error = error;
  }

  /**
   * Parse response given by superagent library
   *
   * @param {Object} response
   * @returns {Object}
   * @private
   */
  _parseResponse(response) {
    if (response.error) {
      this._error = response.error;
    }

    this._statusCode = response.status;

    return response.body;
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
