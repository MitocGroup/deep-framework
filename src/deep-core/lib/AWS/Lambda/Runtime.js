/**
 * Created by AlexanderC on 5/25/15.
 */
'use strict';

import {Interface} from '../../OOP/Interface';
import {Response} from './Response';
import {Request} from './Request';

/**
 * Lambda runtime context
 */
export class Runtime extends Interface {
  /**
   * @param {Object} kernel
   */
  constructor(kernel) {
    super(['handle']);

    this._kernel = kernel;
    this._request = null;
    this._context = null;
    this._allowMissingUserContext = false;

    this._fillDenyMissingUserContextOption();
  }

  /**
   * @returns {Boolean}
   */
  get allowMissingUserContext() {
    return this._allowMissingUserContext;
  }

  /**
   * @private
   */
  _fillDenyMissingUserContextOption() {
    if (this._kernel.config.hasOwnProperty('forceUserIdentity')) {
      this._allowMissingUserContext = this._kernel.config.forceUserIdentity;
    }
  }

  /**
   * @returns {Object}
   */
  get kernel() {
    return this._kernel;
  }

  /**
   * @returns {Function}
   */
  get lambda() {
    let _this = this;

    return function(event, context) {
      _this.run(event, context);
    };
  }

  /**
   * @param {*} event
   * @param {*} context
   * @returns {Runtime}
   */
  run(event, context) {
    this._addExceptionListener();

    this._context = context;
    this._request = new Request(event);

    if (!this._allowMissingUserContext) {

    }

    this.handle(this._request);

    return this;
  }

  /**
   * @private
   */
  _addExceptionListener() {
    process.removeAllListeners('uncaughtException');
    process.on('uncaughtException', function(error) {
      return this.createError(error).send();
    }.bind(this));
  }

  /**
   * @param {String} iError
   */
  createError(iError) {
    let oError = {};

    if (typeof iError === 'string') {
      oError = {
        errorType: 'Error',
        errorMessage: iError,
        errorStack: (new Error(iError)).stack,
      };
    } else {
      oError = {
        errorType: iError.name,
        errorMessage: iError.message,
        errorStack: iError.stack,
      };
    }

    let response = new Response(oError);

    response.runtimeContext = this._context;

    return response;
  }

  /**
   * @param {Object} data
   */
  createResponse(data) {
    let response = new Response(data);
    response.runtimeContext = this._context;

    return response;
  }

  /**
   * @returns {Request}
   */
  get request() {
    return this._request;
  }
}
