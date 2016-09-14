/**
 * Created by AlexanderC on 6/08/16.
 */

'use strict';

import {_extend as extend} from 'util';
import AWS from 'aws-sdk';

export class EventualConsistency {
  /**
   * @param {AWS.DynamoDB|AWS.DynamoDB.DocumentClient|*} dynamoDb
   * @param {AWS.DynamoDB|AWS.DynamoDB.DocumentClient|*} dynamoDbDocumentClient
   * @param {Kernel} deepKernel
   * @param {Object} modelsToExtend
   */
  constructor(dynamoDb, dynamoDbDocumentClient, deepKernel, modelsToExtend) {
    this._dynamoDb = dynamoDb;
    this._dynamoDbDocumentClient = dynamoDbDocumentClient;
    this._kernel = deepKernel;
    this._modelsToExtend = modelsToExtend;
    this._localModel = false;
    this._sqsInstances = {};
  }

  /**
   * @returns {Object}
   */
  get _queuesModelMapping() {
    return this._kernel.config.dbOffloadQueues || {};
  }

  /**
   * @param {String} modelName
   * @returns {AWS.SQS|*}
   */
  _sqs(modelName) {
    if (!this._sqsInstances.hasOwnProperty(modelName)) {
      let queuesMapping = this._queuesModelMapping;

      if (!queuesMapping.hasOwnProperty(modelName)) {
        return null;
      }

      this._sqsInstances[modelName] = new AWS.SQS({
        region: EventualConsistency.getRegionFromSqsQueueUrl(queuesMapping[modelName].url),
      });
    }

    return this._sqsInstances[modelName];
  }

  /**
   * @param {String} modelName
   * @param {String} method
   * @param {Object} payload
   * @param {Function} callback
   * @returns {*}
   * @private
   */
  _sendPayload(modelName, method, payload, callback) {
    let queuesMapping = this._queuesModelMapping;

    if (!queuesMapping.hasOwnProperty(modelName)) {
      return callback(null);
    }

    let params = {
      MessageBody: JSON.stringify({method, payload,}),
      QueueUrl: queuesMapping[modelName].url,
    };

    this._sqs(modelName).sendMessage(params, error => callback(error));
  }

  /**
   * @param {String} queueUrl
   * @returns {String}
   */
  static getRegionFromSqsQueueUrl(queueUrl) {
    let regionParts = queueUrl.match(/\.([^\.]+)\.amazonaws\.com\/.*/i);

    if (!regionParts || regionParts.length === 0) {
      throw new Error(queueUrl, 'Unable to extract AWS region.');
    }

    return regionParts[1];
  }

  /**
   * @param {Boolean} state
   * @returns {EventualConsistency}
   */
  localMode(state) {
    this._localModel = !!state;

    return this;
  }

  /**
   * @returns {AWS.DynamoDB|AWS.DynamoDB.DocumentClient|*}
   */
  extend() {

    // avois doing it for older deploys
    if (this._kernel.config.dbOffloadQueues) {
      EventualConsistency.PROXIED_METHODS.forEach((method) => {
        let originalMethod = `__deep_db_EC_${method}__`;

        this._dynamoDbDocumentClient[originalMethod] = this._dynamoDbDocumentClient[method];
        this._dynamoDbDocumentClient[method] = this._ecExecCb(method, originalMethod);
      });

      this._extendModels();
      this._dynamoDbDocumentClient[EventualConsistency.DEEP_DB_DECORATOR_FLAG] = true;
    }

    return this._dynamoDbDocumentClient;
  }

  /**
   * @private
   */
  _extendModels() {
    let queuesMapping = this._queuesModelMapping;
    let tablesNames = this._kernel.config.tablesNames;

    for (let modelName in this._modelsToExtend) {
      if (!this._modelsToExtend.hasOwnProperty(modelName) ||
        !queuesMapping.hasOwnProperty(modelName)) { // weird case that should be covered
        continue;
      }

      let model = this._modelsToExtend[modelName];

      model[EventualConsistency.DEEP_DB_EC_MODEL_NAME_PROPERTY] = tablesNames[modelName];
      model[EventualConsistency.DEEP_DB_EC_STATE_PROPERTY] = false;
      model[EventualConsistency.DEEP_DB_EC_STATE_PROPERTY_SETTER] = (state) => {
        model[EventualConsistency.DEEP_DB_EC_STATE_PROPERTY] = !!state;

        return model;
      };
    }
  }

  /**
   * @param {String} method
   * @param {String} originalMethod
   * @returns {Function}
   */
  _ecExecCb(method, originalMethod) {
    return (payload, originalCb) => {
      let tableName = EventualConsistency._getTableNameFromPayload(method, payload);

      this._originalExec(
        method,
        originalMethod,
        payload,
        originalCb,
        this._isEnabledForTable(tableName) ? () => {
          if (this._localModel) {
            process.nextTick(() => {

              //todo: remove this log?
              console.log(`DynamoDB EC->${method}(`, JSON.stringify(payload), ')');

              this._dynamoDbDocumentClient[originalMethod](extend({}, payload), () => {});
            });

            return originalCb(null, {Attributes: {},}); // assume that no errors occured while writing to SQS
          }

          this._sendPayload(
            this._modelName(tableName),
            method,
            payload,
            error => originalCb(error, {Attributes: {},})
          );
        } : null
      );
    };
  }

  /**
   * @param {String} method
   * @param {String} originalMethod
   * @param {Object} payload
   * @param {Function} originalCb
   * @param {Function} onOpFailedCb
   * @private
   */
  _originalExec(method, originalMethod, payload, originalCb, onOpFailedCb = null) {
    this._dynamoDbDocumentClient[originalMethod](
      payload,
      (error, data) => {
        if (error &&
          onOpFailedCb &&
          EventualConsistency.ERRORS_TO_SKIP.indexOf(error.code) === -1) {

          return onOpFailedCb();
        }

        originalCb(error, data);
      }
    );
  }

  /**
   * @returns {String[]}
   */
  static get ERRORS_TO_SKIP() {
    return [
      'ResourceNotFoundException',
      'ItemCollectionSizeLimitExceededException',
      'ConditionalCheckFailedException',
    ];
  }

  /**
   * @param {String} tableName
   * @returns {String}
   */
  _modelName(tableName) {
    for (let modelName in this._modelsToExtend) {
      if (!this._modelsToExtend.hasOwnProperty(modelName)) {
        continue;
      }

      let model = this._modelsToExtend[modelName];

      if (model[EventualConsistency.DEEP_DB_EC_MODEL_NAME_PROPERTY] === tableName) {
        return modelName;
      }
    }

    return null;
  }

  /**
   * @param {String} tableName
   * @returns {Boolean}
   */
  _isEnabledForTable(tableName) {
    for (let modelName in this._modelsToExtend) {
      if (!this._modelsToExtend.hasOwnProperty(modelName)) {
        continue;
      }

      let model = this._modelsToExtend[modelName];

      if (model[EventualConsistency.DEEP_DB_EC_MODEL_NAME_PROPERTY] === tableName) {
        if (model[EventualConsistency.DEEP_DB_EC_STATE_PROPERTY]) {
          return true;
        }

        break;
      }
    }

    return false;
  }

  /**
   * @param {String} str
   * @returns {String}
   */
  static _capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * @param {String} method
   * @param {Object} payload
   * @returns {String}
   * @private
   */
  static _getTableNameFromPayload(method, payload) {
    let tableName = null;

    switch (method) {
      case 'put':
      case 'update':
        tableName = payload.TableName;
        break;
      default: throw new Error(`Unknown DynamoDB eventual consistency method '${method}'`);
    }

    return tableName;
  }

  /**
   * @returns {Object}
   */
  get modelsToExtend() {
    return this._modelsToExtend;
  }

  /**
   * @returns {AWS.DynamoDB|AWS.DynamoDB.DocumentClient|*}
   */
  get dynamoDbDocumentClient() {
    return this._dynamoDbDocumentClient;
  }

  /**
   * @returns {AWS.DynamoDB|AWS.DynamoDB.DocumentClient|*}
   */
  get dynamoDb() {
    return this._dynamoDb;
  }

  /**
   * @returns {String[]}
   */
  static get PROXIED_METHODS() {
    return [
      'put', 'update',
    ];
  }

  /**
   * @returns {String}
   */
  static get DEEP_DB_EC_STATE_PROPERTY() {
    return '_eventualConsistency';
  }

  /**
   * @returns {String}
   */
  static get DEEP_DB_EC_MODEL_NAME_PROPERTY() {
    return '__deep_ec_short_model_name__';
  }

  /**
   * @returns {String}
   */
  static get DEEP_DB_EC_STATE_PROPERTY_SETTER() {
    return 'eventualConsistency';
  }

  /**
   * @returns {String}
   */
  static get DEEP_DB_DECORATOR_FLAG() {
    return '__deep_db_ec_decorator__';
  }
}
