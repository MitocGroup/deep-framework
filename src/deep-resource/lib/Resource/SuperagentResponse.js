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

    this._error = error;

    // @todo: treat the empty body somehow else?
    if (!data.body && (!data.status || data.status > 300)) {
      this._error = data.error || 'Unexpected error occurred';
      this._statusCode = data.status || 500;
    } else {
      this._data = request.isLambda
        ? this._parseLambdaResponse(data)
        : this._parseResponse(data);
    }
  }

  /**
   * Parse response given by superagent library
   * for Lambdas proxied through ApiGateway
   *
   * @param {Object} response
   * @returns {Object}
   * @private
   */
  _parseLambdaResponse(response) {
    if (typeof response.body.errorMessage === 'string') {
      this._error = response.body.errorMessage;
    }

    this._statusCode = this._error ? 500 : response.status;

    return this._error ? null : response.body;
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
