/**
 * Created by AlexanderC on 6/15/15.
 */

'use strict';

import Kernel from 'deep-kernel';
import {ObjectToJoi} from './ObjectToJoi';
import {ValidationSchemaNotFoundException} from './Exception/ValidationSchemaNotFoundException';
import {InvalidJoiSchemaException} from './Exception/InvalidJoiSchemaException';
import Joi from 'joi';
import {ObjectValidationFailedException} from './Exception/ObjectValidationFailedException';
import path from 'path';
import Core from 'deep-core';

/**
 * Validation engine
 */
export class Validation extends Kernel.ContainerAware {
  /**
   * @param {Array} models
   */
  constructor(models = []) {
    super();

    this._schemas = this._rawModelsToSchemas(models);
  }

  /**
   * @param {Runtime} lambdaRuntime
   * @param {String} schemaName
   * @param {Function} cb
   * @returns {Validation}
   */
  validateRuntimeInput(lambdaRuntime, schemaName, cb) {
    if (!this.hasSchema(schemaName)) {
      lambdaRuntime.createError(new ValidationSchemaNotFoundException(schemaName)).send();
      return this;
    }

    let validationResult = this.validate(schemaName, lambdaRuntime.request.data, true);

    if (!validationResult.error) {
      cb(validationResult.value);
      return this;
    }

    lambdaRuntime.createError(validationResult.error).send();

    return this;
  }

  /**
   * @param {String} schemaName
   * @param {*} valueObject
   * @param {Boolean} returnRaw
   * @returns {*}
   */
  validate(schemaName, valueObject, returnRaw = false) {
    let validationSchema = this.getSchema(schemaName);

    let result = Joi.validate(
      valueObject,
      validationSchema,
      {
        stripUnknown: true,
        convert: true,
        abortEarly: false,
      }
    );

    if (returnRaw) {
      return result;
    }

    if (result.error) {
      throw new ObjectValidationFailedException(schemaName, result.error);
    }

    return result.value;
  }

  /**
   * @todo: find a better way to inject libraries...
   *
   * @param {Function} cb
   * @returns {Object}
   */
  schemaFromValidationCb(cb) {
    return cb(Joi);
  }

  /**
   * @returns {Object[]}
   */
  get schemas() {
    return this._schemas;
  }

  /**
   * @returns {String[]}
   */
  get schemasNames() {
    return Object.keys(this._schemas);
  }

  /**
   * @param {String} schemaName
   * @param {Object} schema
   * @returns {Validation}
   */
  setSchemaRaw(schemaName, schema) {
    this._schemas[schemaName] = Validation.normalizeSchema(schema);

    return this;
  }

  /**
   * @param {String} schemaName
   * @param {Object} schema
   * @returns {Validation}
   */
  setSchema(schemaName, schema) {
    if (!schema.isJoi) {
      throw new InvalidJoiSchemaException(schemaName);
    }

    this._schemas[schemaName] = schema;

    return this;
  }

  /**
   * @param {String} schemaName
   * @param {Object} schema
   * @returns {Validation}
   */
  setGuessSchema(schemaName, schema) {
    if (typeof schema === 'function') {
      schema = this.schemaFromValidationCb(schema);
    }

    let setSchemaMethod = schema.isJoi ? 'setSchema' : 'setSchemaRaw';

    return this[setSchemaMethod](schemaName, schema);
  }

  /**
   * @param {String} schemaName
   * @returns {Boolean}
   */
  hasSchema(schemaName) {
    return typeof this._schemas[schemaName] !== 'undefined';
  }

  /**
   * @param {String} schemaName
   * @returns {Object}
   */
  getSchema(schemaName) {
    if (!this.hasSchema(schemaName)) {
      throw new ValidationSchemaNotFoundException(schemaName);
    }

    let schema = this._schemas[schemaName];

    // Let's assume it's an path while lazy loading in backend context
    if (typeof schema === 'string') {
      return this
        .setGuessSchema(schemaName, require(schema))
        .getSchema(schemaName);
    }

    return schema;
  }

  /**
   * Booting a certain service
   *
   * @param {Kernel} kernel
   * @param {Function} callback
   */
  boot(kernel, callback) {
    this._schemas = this._rawModelsToSchemas(kernel.config.models);

    let universalRequire = new Core.Generic.UniversalRequire();
    let remainingSchemas = kernel.config.validationSchemas.length;

    // Load custom schemas
    kernel.config.validationSchemas.forEach((schemaName) => {
      let relativeSchemaPath = path.join(
        Core.AWS.Lambda.Runtime.VALIDATION_SCHEMAS_DIR,
        `${schemaName}.js`
      );

      if (kernel.isBackend) {
        this._schemas[schemaName] = path.join(process.cwd(), relativeSchemaPath);

        remainingSchemas--;
      } else {
        let schemaUrl = path.join(path.sep, relativeSchemaPath);

        universalRequire.require(schemaUrl, (error, schemaObj) => {

          // @todo: abstract it somehow?
          if (error) {
            console.error(`Error while loading schema ${schemaName}: ${error}`);
          } else {
            this.setGuessSchema(schemaName, schemaObj);
          }

          remainingSchemas--;
        });
      }
    });

    let checkRemainingSchemas = (onFail) => {
      if (remainingSchemas <= 0) {
        callback();
      } else {
        setTimeout(() => {
          onFail(onFail);
        }, 50);
      }
    };

    checkRemainingSchemas(checkRemainingSchemas);
  }

  /**
   * @param {Array} rawModels
   * @returns {Object}
   * @private
   */
  _rawModelsToSchemas(rawModels) {
    let modelsSchema = {};

    for (let modelKey in rawModels) {
      if (!rawModels.hasOwnProperty(modelKey)) {
        continue;
      }

      let backendModels = rawModels[modelKey];

      for (let schemaName in backendModels) {
        if (!backendModels.hasOwnProperty(schemaName)) {
          continue;
        }

        let schema = backendModels[schemaName];

        // @todo: move this sh*t into DB somehow...
        schema.Id = schema.Id || 'timeUUID';

        modelsSchema[schemaName] = Validation.normalizeSchema(schema);
      }
    }

    return modelsSchema;
  }

  /**
   * @param {Object} rawSchema
   * @returns {Object}
   */
  static normalizeSchema(rawSchema) {
    return new ObjectToJoi(rawSchema).transform();
  }
}
