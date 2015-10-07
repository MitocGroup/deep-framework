/**
 * Created by AlexanderC on 6/15/15.
 */

'use strict';

import Kernel from 'deep-kernel';
import {ObjectToJoi} from './ObjectToJoi';
import {ModelNotFoundException} from './Exception/ModelNotFoundException';
import Joi from 'joi';
import {ObjectValidationFailedException} from './Exception/ObjectValidationFailedException';
import {Exception} from './Exception/Exception';

/**
 * Validation engine
 */
export class Validation extends Kernel.ContainerAware {
  /**
   * @param {Array} models
   */
  constructor(models = []) {
    super();

    this._immutable = false;
    this._models = this._rawModelsToSchemas(models);
  }

  /**
   * @param {Boolean} state
   */
  set immutable(state) {
    this._assureImmutable();

    this._immutable = state;
  }

  /**
   * @returns {Boolean}
   */
  get immutable() {
    return this._immutable;
  }

  /**
   * @param {String} modelName
   * @param {*} valueObject
   * @returns {*}
   */
  validate(modelName, valueObject) {
    let model = this.get(modelName);
    let result = Joi.validate(valueObject, Joi.object().keys(model));

    if (result.error) {
      throw new ObjectValidationFailedException(modelName, result.error);
    }

    return result.value;
  }

  /**
   * @returns {Object[]}
   */
  get models() {
    return this._models;
  }

  /**
   * @param {String} modelName
   * @param {Object} schema
   * @returns {Validation}
   */
  setRaw(modelName, schema) {
    this._assureImmutable();

    this._models[modelName] = Validation.normalizeSchema(schema);

    return this;
  }

  /**
   * @param {String} modelName
   * @param {Object} schema
   * @returns {Validation}
   */
  set(modelName, schema) {
    this._assureImmutable();

    this._models[modelName] = schema;

    return this;
  }

  /**
   * @param {String} modelName
   * @returns {Boolean}
   */
  has(modelName) {
    return typeof this._models[modelName] !== 'undefined';
  }

  /**
   * @param {String} modelName
   * @returns {Object}
   */
  get(modelName) {
    if (!this.has(modelName)) {
      throw new ModelNotFoundException(modelName);
    }

    return this._models[modelName];
  }

  /**
   * Booting a certain service
   *
   * @param {Kernel} kernel
   * @param {Function} callback
   */
  boot(kernel, callback) {
    this._assureImmutable();

    this._models = this._rawModelsToSchemas(kernel.config.models);

    callback();
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

      for (let modelName in backendModels) {
        if (!backendModels.hasOwnProperty(modelName)) {
          continue;
        }

        let schema = backendModels[modelName];

        // @todo: move this sh*t into DB somehow...
        schema.Id = schema.Id || 'timeUUID';

        modelsSchema[modelName] = Validation.normalizeSchema(schema);
      }
    }

    return modelsSchema;
  }

  /**
   * @private
   */
  _assureImmutable() {
    if (this._immutable) {
      throw new Exception('You are not abble to alter the state after setting it immutable');
    }
  }

  /**
   * @param {Object} rawSchema
   * @returns {Object}
   */
  static normalizeSchema(rawSchema) {
    return new ObjectToJoi(rawSchema).transform();
  }
}
