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
import path from 'path';
import fs from 'fs';

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
   * @returns {Runtime}
   */
  run(event, context) {
    this._context = new Context(context);
    this._request = new Request(event);

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
    let validation = this._kernel.get('validation');
    let validationSchemaName = validationSchema;

    if (typeof validationSchema !== 'string') {
      validationSchemaName = this._injectValidationSchema(validationSchema);
    } else if (!validation.hasSchema(validationSchemaName)) {

      // assume process.cwd() === /var/task
      let schemasPath = path.join(process.cwd(), Runtime.VALIDATION_SCHEMAS_DIR);
      let schemaFile = path.join(schemasPath, `${validationSchemaName}.js`);

      if (fs.existsSync(schemaFile)) {
        this._injectValidationSchema(require(schemaFile), validationSchemaName);
      }
    }

    this.validateInput(validationSchemaName, this.handle);
  }

  /**
   * @param {Object} schema
   * @param {String|null} name
   * @returns {String}
   * @private
   */
  _injectValidationSchema(schema, name = null) {
    let validation = this._kernel.get('validation');

    if (typeof schema === 'function') {
      schema = validation.schemaFromValidationCb(schema);
    }

    let setSchemaMethod = schema.isJoi ? 'setSchema' : 'setSchemaRaw';

    name = name || `DeepHandlerValidation_${new Date().getTime()}`;

    validation[setSchemaMethod](name, schema);

    return name;
  }

  /**
   * @param {String|Error|*} error
   */
  createError(error) {
    return new ErrorResponse(this, error);
  }

  /**
   * @param {Object} data
   */
  createResponse(data) {
    return new Response(this, data);
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
