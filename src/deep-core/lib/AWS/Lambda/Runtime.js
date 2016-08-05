/**
 * Created by AlexanderC on 5/25/15.
 */
'use strict';

import {Interface} from '../../OOP/Interface';
import {Response} from './Response';
import {ErrorResponse} from './ErrorResponse';
import {Request} from './Request';
import {InvalidCognitoIdentityException} from './Exception/InvalidCognitoIdentityException';
import {MissingUserContextException} from './Exception/MissingUserContextException';
import {Context} from './Context';
import {Sandbox} from '../../Runtime/Sandbox';
import {Resolver} from './Resolver';

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
    this._resolver = null;

    this._loggedUserId = null;
    this._forceUserIdentity = false;
    this._contextSent = false;

    this._calleeConfig = null;

    this._fillDenyMissingUserContextOption();
  }

  /**
   * @returns {null|Context}
   */
  get context() {
    return this._context;
  }

  /**
   * @returns {null|Resolver}
   */
  get resolver() {
    return this._resolver;
  }

  /**
   * @returns {Boolean}
   */
  get contextSent() {
    return this._contextSent;
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
   * @returns {Function}
   */
  get lambda() {
    let _this = this;

    return function(event, context) {
      _this.run(event, context);
    };
  }

  /**
   * @param {String} schemaName
   * @param {Function} cb
   * @returns {Runtime}
   */
  validateInput(schemaName, cb) {
    let validation = this._kernel.get('validation');

    validation.validateRuntimeInput(this, schemaName, cb);

    return this;
  }

  /**
   * @param {Object} event
   * @param {Object} context
   * @param {Function} lambdaCallback
   * @returns {Runtime}
   */
  run(event, context, lambdaCallback = null) {
    this._context = new Context(context);
    this._request = new Request(event);

    if (lambdaCallback) {
      this._resolver = new Resolver(lambdaCallback);

      this._resolver.registerSucceedCallback(() => {
        let db = this._kernel.get('db');
        let vogelsDynamoDriver = db.vogelsDynamoDriver;

        if (vogelsDynamoDriver.config.httpOptions.agent) {
          vogelsDynamoDriver.config.httpOptions.agent.destroy();
        }

        db._fixNodeHttpsIssue();
      });
    }

    this._context.waitForEmptyEventLoop();

    this.logService.rumLog({
      service: 'deep-core',
      resourceType: 'Lambda',
      resourceId: this._context.invokedFunctionArn,
      eventName: 'Run',
    });

    new Sandbox(() => {
      this._fillUserContext();

      if (!this._loggedUserId && this._forceUserIdentity) {
        throw new MissingUserContextException();
      }

      let validationSchema = this.validationSchema;

      if (validationSchema) {
        this._runValidate(validationSchema);
      } else {
        this.handle(this._request);
      }
    })
      .fail((error) => {
        this.createError(error).send();
      })
      .run();

    return this;
  }

  /**
   * @param {String} validationSchema
   * @private
   */
  _runValidate(validationSchema) {
    let validationSchemaName = validationSchema;

    if (typeof validationSchema !== 'string') {
      validationSchemaName = this._injectValidationSchema(validationSchema);
    }

    this.validateInput(validationSchemaName, (validatedData) => {
      this.handle(validatedData);
    });
  }

  /**
   * @param {Object} schema
   * @param {String|null} name
   * @returns {String}
   * @private
   */
  _injectValidationSchema(schema, name = null) {
    let validation = this._kernel.get('validation');

    name = name || `DeepHandlerValidation_${new Date().getTime()}`;

    validation.setGuessSchema(name, schema);

    return name;
  }

  /**
   * @param {String|Error|*} error
   * @returns {ErrorResponse}
   */
  createError(error) {
    return new ErrorResponse(this, error);
  }

  /**
   * @param {Object} data
   * @returns {Response}
   */
  createResponse(data) {
    return new Response(this, data);
  }

  /**
   * @param {Object} data
   * @param {Number} ttl
   * @param {Function} callback
   */
  createCachedResponse(data, ttl = 0, callback = response => response.send()) {
    let publicCache = this._kernel.get('cache').shared;
    let publicCacheKey = publicCache.buildKeyFromLambdaRuntime(this);
    let response = new Response(this, data);

    publicCache.assure(publicCacheKey, {body: data}, ttl, () => {
      callback(response);
    });
  }

  /**
   * @returns {String}
   */
  get calleeName() {
    if (this._context && this._context.has('invokedFunctionArn')) {
      let calleeArn = this._context.getOption('invokedFunctionArn');

      return calleeArn.replace(/^.+:function:/i, '');
    }

    return null;
  }

  /**
   * @returns {null|Object}
   */
  get calleeConfig() {
    if (!this._calleeConfig &&
      this._context &&
      this._kernel &&
      this._context.has('invokedFunctionArn')) {

      let resource = this._kernel.get('resource');
      let calleeArn = this._context.getOption('invokedFunctionArn');

      this._calleeConfig = resource.getActionConfig(calleeArn);
    }

    return this._calleeConfig;
  }

  /**
   * @returns {String}
   */
  get validationSchema() {
    return this.calleeConfig ? (this.calleeConfig.validationSchema || null) : null;
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
   * @returns {Object}
   */
  get logService() {
    return this.kernel.get('log');
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

  /**
   * @returns {String}
   */
  static get VALIDATION_SCHEMAS_DIR() {
    return '__deep_validation_schemas__';
  }
}
