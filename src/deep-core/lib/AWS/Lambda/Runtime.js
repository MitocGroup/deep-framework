/**
 * Created by AlexanderC on 5/25/15.
 */
'use strict';

import {Interface} from '../../OOP/Interface';
import {Response} from './Response';
import {Request} from './Request';
import {InvalidCognitoIdentityException} from './Exception/InvalidCognitoIdentityException';

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

    this._loggedUserId = null;
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

  /**
   * @returns {Object}
   */
  get securityService() {
    return this.kernel.get('security');
  }

  /**
   * Retrieves logged user id from lambda context
   *
   * @returns {String|null}
   */
  get loggedUserId() {
    if (this._loggedUserId) {
      return this._loggedUserId;
    }

    if (this._context &&
      this._context.hasOwnProperty('identity') &&
      this._context.identity.hasOwnProperty('cognitoIdentityPoolId') &&
      this._context.identity.hasOwnProperty('cognitoIdentityId')
    ) {
      let identityPoolId = this._context.identity.cognitoIdentityPoolId;

      if (this.securityService.identityPoolId !== identityPoolId) {
        throw new InvalidCognitoIdentityException(identityPoolId);
      }

      this._loggedUserId = this._context.identity.cognitoIdentityId;
    }

    return this._loggedUserId;
  }
}
