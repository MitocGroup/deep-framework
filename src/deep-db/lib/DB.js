/**
 * Created by AlexanderC on 6/15/15.
 */

'use strict';

import Kernel from 'deep-kernel';
import Vogels from 'vogels';
import {ExtendModel} from './Vogels/ExtendModel';
import {ModelNotFoundException} from './Exception/ModelNotFoundException';
import Validation from 'deep-validation';
import Utils from 'util';
import {FailedToCreateTableException} from './Exception/FailedToCreateTableException';
import {FailedToCreateTablesException} from './Exception/FailedToCreateTablesException';
import {AbstractDriver} from './Local/Driver/AbstractDriver';
import {AutoScaleDynamoDB} from './DynamoDB/AutoScaleDynamoDB';
import {EventualConsistency} from './DynamoDB/EventualConsistency';
import https from 'https';

/**
 * Vogels wrapper
 */
export class DB extends Kernel.ContainerAware {
  /**
   * @param {Array} models
   * @param {Object} tablesNames
   */
  constructor(models = [], tablesNames = {}) {
    super();

    this._tablesNames = tablesNames;
    this._validation = new Validation(models);
    this._models = this._rawModelsToVogels(models);
  }

  /**
   * @returns {Validation}
   */
  get validation() {
    return this._validation;
  }

  /**
   * @returns {Vogels[]}
   */
  get models() {
    return this._models;
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
   * @returns {Vogels}
   */
  get(modelName) {
    if (!this.has(modelName)) {
      modelName = this._lispCase(modelName);

      if (!this.has(modelName)) {
        throw new ModelNotFoundException(modelName);
      }
    }

    let model = this._models[modelName];

    if (this.kernel && this.kernel.isRumEnabled) {

      // inject logService into extended model to log RUM events
      model.logService = this.kernel.get('log');
    }

    return model;
  }

  /**
   * @param {String} modelName
   * @param {Function} callback
   * @param {Object} options
   * @returns {DB}
   */
  assureTable(modelName, callback, options = {}) {
    if (!this.has(modelName)) {
      throw new ModelNotFoundException(modelName);
    }

    options = Utils._extend(DB.DEFAULT_TABLE_OPTIONS, options);
    options[modelName] = options;

    Vogels.createTables(options, (error) => {
      if (error) {
        throw new FailedToCreateTableException(modelName);
      }

      callback();
    });

    return this;
  }

  /**
   * @param {Function} callback
   * @param {Object} options
   * @returns {DB}
   */
  assureTables(callback, options = {}) {
    let allModelsOptions = {};
    let allModelNames = [];

    for (let modelName in this._models) {
      if (!this._models.hasOwnProperty(modelName)) {
        continue;
      }

      allModelsOptions[modelName] = Utils._extend(
        DB.DEFAULT_TABLE_OPTIONS,
        options.hasOwnProperty(modelName) ? options[modelName] : {}
      );
      allModelNames.push(modelName);
    }

    Vogels.createTables(allModelsOptions, (error) => {
      if (error) {
        throw new FailedToCreateTablesException(allModelNames, error);
      }

      callback();
    }, this._localBackend);

    return this;
  }

  /**
   * Booting a certain service
   *
   * @param {Kernel} kernel
   * @param {Function} callback
   */
  boot(kernel, callback) {
    this._validation.boot(kernel, () => {
      this._tablesNames = kernel.config.tablesNames;
      this._models = this._rawModelsToVogels(kernel.config.models);

      if (this._localBackend) {
        this._enableLocalDB(() => {
          if (!Vogels.documentClient().hasOwnProperty(EventualConsistency.DEEP_DB_DECORATOR_FLAG)) {
            this._initEventualConsistency(kernel);
          }

          callback();
        });
      } else {
        this._fixNodeHttpsIssue();

        // it's important to be loaded before any other decorator
        if (!Vogels.documentClient().hasOwnProperty(EventualConsistency.DEEP_DB_DECORATOR_FLAG)) {
          this._initEventualConsistency(kernel);
        }

        if (!Vogels.documentClient().hasOwnProperty(AutoScaleDynamoDB.DEEP_DB_DECORATOR_FLAG)) {
          this._initVogelsAutoscale(kernel);
        }

        callback();
      }
    });
  }

  /**
   * NetworkingError: write EPROTO
   *
   * @see https://github.com/aws/aws-sdk-js/issues/862
   * @private
   */
  _fixNodeHttpsIssue() {
    Vogels.AWS.config.maxRetries = 3;

    this._setVogelsDriver(new Vogels.AWS.DynamoDB({
      httpOptions: {
        agent: new https.Agent({
          rejectUnauthorized: true,
          keepAlive: true,
          secureProtocol: 'TLSv1_method',
          ciphers: 'ALL',
        }),
      },
    }));
  }

  /**
   * @param {Kernel} kernel
   *
   * @private
   */
  _initEventualConsistency(kernel) {
    Vogels.documentClient(
      new EventualConsistency(
        Vogels.dynamoDriver(),
        Vogels.documentClient(),
        kernel,
        this._models
      ).localMode(this._localBackend).extend()
    );
  }

  /**
   * @param {Kernel} kernel
   *
   * @private
   */
  _initVogelsAutoscale(kernel) {
    Vogels.documentClient(
      new AutoScaleDynamoDB(
        Vogels.dynamoDriver(),
        Vogels.documentClient(),
        kernel
      ).extend()
    );
  }

  /**
   * @param {Object} driver
   * @returns {DB}
   * @private
   */
  _setVogelsDriver(driver) {
    Vogels.dynamoDriver(driver);

    return this;
  }

  /**
   * @returns {AWS.DynamoDB}
   */
  get vogelsDynamoDriver() {
    return Vogels.dynamoDriver();
  }

  /**
   * @param {Function} callback
   * @param {String} driver
   * @param {Number} tts
   * @returns {AbstractDriver}
   */
  static startLocalDynamoDBServer(callback, driver = 'LocalDynamo', tts = AbstractDriver.DEFAULT_TTS) {
    let LocalDBServer = require('./Local/DBServer').DBServer;

    let server = LocalDBServer.create(driver);

    server.start(callback, tts);

    return server;
  }

  /**
   * @returns {AWS.DynamoDB|VogelsMock.AWS.DynamoDB|*}
   * @private
   */
  get _localDynamoDb() {
    return new Vogels.AWS.DynamoDB({
      endpoint: new Vogels.AWS.Endpoint(`http://localhost:${DB.LOCAL_DB_PORT}`),
      accessKeyId: 'fake',
      secretAccessKey: 'fake',
      region: 'us-east-1',
    });
  }

  /**
   * @param {Function} callback
   * @private
   */
  _enableLocalDB(callback) {
    this._setVogelsDriver(this._localDynamoDb);

    this.assureTables(callback);
  }

  /**
   * @returns {Object}
   */
  static get DEFAULT_TABLE_OPTIONS() {
    return {
      readCapacity: 1,
      writeCapacity: 1,
    };
  }

  /**
   * @param {Array} rawModels
   * @returns {Object}
   */
  _rawModelsToVogels(rawModels) {
    let models = {};

    for (let modelKey in rawModels) {
      if (!rawModels.hasOwnProperty(modelKey)) {
        continue;
      }

      let backendModels = rawModels[modelKey];

      for (let modelName in backendModels) {
        if (!backendModels.hasOwnProperty(modelName)) {
          continue;
        }

        models[modelName] = new ExtendModel(Vogels.define(
          modelName,
          this._wrapModelSchema(modelName)
        )).inject();
      }
    }

    return models;
  }

  /**
   * @param {String} name
   * @returns {Object}
   * @private
   */
  _wrapModelSchema(name) {
    return {
      hashKey: 'Id',
      timestamps: true,
      tableName: this._tablesNames[name],
      schema: this._validation.getSchema(name),
    };
  }

  /**
   * @param {String} str
   * @returns {String}
   * @private
   */
  _lispCase(str) {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .split(/[^a-z0-9\-]+/i)
      .join('-')
      .toLowerCase();
  }

  /**
   * @returns {Number}
   */
  static get LOCAL_DB_PORT() {
    return AbstractDriver.DEFAULT_PORT;
  }
}
