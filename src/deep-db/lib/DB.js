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
   * @param {Boolean} forcePartitionField
   * @param {String[]} nonPartitionedModels
   */
  constructor(models = [], tablesNames = {}, forcePartitionField = false, nonPartitionedModels = []) {
    super();

    this._tablesNames = tablesNames;
    this._forcePartitionField = forcePartitionField;
    this._dynamoDBPartitionKey = null;

    this._validation = new Validation(models, forcePartitionField, nonPartitionedModels);
    this._rawModels = this._rawModelsVector(models);
    this._models = {};
  }

  /**
   * @returns {Validation}
   */
  get validation() {
    return this._validation;
  }

  /**
   * @returns {String[]}
   */
  get rawModels() {
    return this._rawModels;
  }

  /**
   * @returns {Vogels[]}
   */
  get models() {
    if (this._rawModels.length <= Object.keys(this._models).length) {
      return this._models;
    }
    
    let result = {};
    
    this._rawModels.map(modelName => {
      result[modelName] = this.get(modelName);
    });
    
    return result;
  }

  /**
   * @param {String} modelName
   * @returns {Boolean}
   */
  has(modelName) {
    return this._rawModels.indexOf(modelName) !== -1;
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
    
    if (!this._models.hasOwnProperty(modelName)) {
      this._models[modelName] = this._rawModelToVogels(modelName);
    }
    
    this._ensureModelPartitioned(modelName);

    let model = this._models[modelName];

    // inject logService into extended model to log RUM events
    if (this.kernel && this.kernel.isRumEnabled && !model.hasOwnProperty('logService')) {
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

    this.get(modelName); // ensure DynamoDB model initialized
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

    for (let modelName in this.models) {
      if (!this.models.hasOwnProperty(modelName)) {
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
    this._validation.kernel = kernel;

    this._validation.boot(kernel, () => {
      this._tablesNames = kernel.config.tablesNames;
      this._rawModels = this._rawModelsVector(kernel.config.models);

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
   * @inheritDoc
   */
  cleanup() {
    let vogelsDynamoDriver = this.vogelsDynamoDriver;

    if (vogelsDynamoDriver.config.httpOptions.agent) {
      vogelsDynamoDriver.config.httpOptions.agent.destroy();
    }

    this._fixNodeHttpsIssue();
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
      maxRetries: 8,
      retryDelayOptions: {
        base: 100,
      },
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
   * @param {AWS.Credentials} credentials
   * @returns {DB}
   */
  overwriteCredentials(credentials) {
    let dynamoDriver = Vogels.dynamoDriver();
    let docClient = Vogels.documentClient();

    docClient.service.config.credentials = credentials;
    dynamoDriver.config.credentials = credentials;

    return this;
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
   * @returns {String[]}
   */
  _rawModelsVector(rawModels) {
    let modelsVector = [];

    for (let modelKey in rawModels) {
      if (!rawModels.hasOwnProperty(modelKey)) {
        continue;
      }

      let backendModels = rawModels[modelKey];

      for (let modelName in backendModels) {
        if (!backendModels.hasOwnProperty(modelName)) {
          continue;
        }
        
        modelsVector.push(modelName);
      }
    }

    return modelsVector;
  }
  
  /**
   * @param {String} modelName
   *
   * @returns {*}
   *
   * @private
   */
  _rawModelToVogels(modelName) {
    return new ExtendModel(Vogels.define(
      modelName,
      this._wrapModelSchema(modelName)
    )).inject();
  }

  /**
   * @param {Array} rawModels
   * @returns {Object}
   */
  _rawModelsToVogels(rawModels) {
    let models = {};
    
    this._rawModelsVector(rawModels)
      .map(modelName => {
        models[modelName] = this._rawModelToVogels(modelName);
      });

    return models;
  }
  
  /**
   * @param {String} modelName
   * 
   * @private
   */
  _ensureModelPartitioned(modelName) {
    if (this._dynamoDBPartitionKey 
      && this._models.hasOwnProperty(modelName) 
      && this.validation.isPartitionedModel(modelName)) {

      this._models[modelName].setPartition(
        this._dynamoDBPartitionKey
      );
    }
  }

  /**
   * @param {String} partitionKey
   * @returns {DB}
   */
  setDynamoDBPartitionKey(partitionKey) {
    this._dynamoDBPartitionKey = partitionKey;
    
    Object.keys(this._models).map(modelName => {
      this._ensureModelPartitioned(modelName);
    });

    return this;
  }

  /**
   * @param {String} name
   * @returns {Object}
   * @private
   */
  _wrapModelSchema(name) {
    let schema = {
      timestamps: true,
      tableName: this._tablesNames[name],
      schema: this._validation.getSchema(name),
    };

    if (this._usePartitionField && this.validation.isPartitionedModel(name)) {
      schema.hashKey = ExtendModel.PARTITION_FIELD;
      schema.rangeKey = DB.DEFAULT_KEY_FIELD;
    } else {
      schema.hashKey = DB.DEFAULT_KEY_FIELD;
    }

    return schema;
  }

  /**
   * @returns {Boolean}
   * @private
   */
  get _usePartitionField() {
    return this._forcePartitionField || (this.kernel && this.kernel.accountMicroservice);
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
   * @returns {*}
   * @private
   */
  get _security() {
    return this.container.get('security');
  }

  /**
   * @returns {String}
   */
  static get DEFAULT_KEY_FIELD() {
    return 'Id';
  }

  /**
   * @returns {Number}
   */
  static get LOCAL_DB_PORT() {
    return AbstractDriver.DEFAULT_PORT;
  }
}
