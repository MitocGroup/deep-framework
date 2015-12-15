/**
 * Created by AlexanderC on 5/25/15.
 */
'use strict';

import {Interface} from '../../OOP/Interface';
import {Response} from './Response';
import {Request} from './Request';
import {InvalidCognitoIdentityException} from './Exception/InvalidCognitoIdentityException';
import {MissingUserContextException} from './Exception/MissingUserContextException';
import {Context} from './Context';

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
    this._forceUserIdentity = false;

    this._fillDenyMissingUserContextOption();
  }

  /**
   * @returns {String}
   */
  get loggedUserId() {
    return this._loggedUserId;
  }

  /**
   * @returns {Boolean}
   */
  get forceUserIdentity() {
    return this._forceUserIdentity;
  }

  /**
   * @returns {Object}
   */
  get kernel() {
    return this._kernel;
  }

  /**
   * @returns {null|Context}
   */
  get context() {
    return this._context;
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
    this._context = new Context(context);
    this._request = new Request(event);

    this._addExceptionListener();
    this._fillUserContext();

    if (!this._loggedUserId && this._forceUserIdentity) {
      throw new MissingUserContextException();
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

  /**
   * @returns {Object}
   */
  get securityService() {
    return this.kernel.get('security');
  }

  /**
   * @private
   */
  _fillDenyMissingUserContextOption() {
    if (this._kernel.config.hasOwnProperty('forceUserIdentity')) {
      this._forceUserIdentity = this._kernel.config.forceUserIdentity;
    }
  }

  /**
   * Retrieves logged user id from lambda context
   *
   * @private
   */
  _fillUserContext() {
    if (this._context &&
      this._context.has('identity') &&
      this._context.identity.hasOwnProperty('cognitoIdentityPoolId') &&
      this._context.identity.hasOwnProperty('cognitoIdentityId')
    ) {
      let identityPoolId = this._context.identity.cognitoIdentityPoolId;

      if (this.securityService.identityPoolId !== identityPoolId) {
        throw new InvalidCognitoIdentityException(identityPoolId);
      }

      // inject lambda context into security service
      // and instantiate security token without loading credentials
      this.securityService.warmupBackendLogin(this._context);

      this._loggedUserId = this._context.identity.cognitoIdentityId;
    }
  }
}
