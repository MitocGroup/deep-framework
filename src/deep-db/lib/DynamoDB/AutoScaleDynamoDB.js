/**
 * Created by AlexanderC on 3/14/16.
 */

'use strict';

import dynamoDBThroughput from 'dynamodb-throughput';

export class AutoScaleDynamoDB {
  /**
   * @param {AWS.DynamoDB|AWS.DynamoDB.DocumentClient|*} dynamoDb
   * @param {AWS.DynamoDB|AWS.DynamoDB.DocumentClient|*} dynamoDbDocumentClient
   */
  constructor(dynamoDb, dynamoDbDocumentClient) {
    this._dynamoDb = dynamoDb;
    this._dynamoDbDocumentClient = dynamoDbDocumentClient;

    this._increasedFor = {};
  }

  /**
   * @returns {AWS.DynamoDB|AWS.DynamoDB.DocumentClient|*}
   */
  extend() {
    AutoScaleDynamoDB.PROXIED_METHODS.forEach((method) => {
      let originalMethod = `__deep_db_AS_${method}__`;

      this._dynamoDbDocumentClient[originalMethod] = this._dynamoDbDocumentClient[method];
      this._dynamoDbDocumentClient[method] = (payload, originalCb) => {
        let cb = this._decorate(method, payload, originalCb);

        this._dynamoDbDocumentClient[originalMethod](payload, cb);
      };
    });

    this._dynamoDbDocumentClient[AutoScaleDynamoDB.DEEP_DB_DECORATOR_FLAG] = true;

    return this._dynamoDbDocumentClient;
  }

  /**
   * @param {String} method
   * @param {Object} payload
   * @param {Function} originalCb
   * @returns {Function}
   * @private
   */
  _decorate(method, payload, originalCb) {
    return (error, data) => {
      if (error && error.code === AutoScaleDynamoDB.THROUGHPUT_EXCEEDED_ERROR) {
        let originalError = error;
        let table = AutoScaleDynamoDB._getTableNameFromPayload(method, payload);

        if (!table) {
          console.error(`Unable to find table name in payload while increasing throughput`);
          originalCb(originalError, data);
          return;
        } else if (this._increasedFor[table] &&
          this._increasedFor[table] >= AutoScaleDynamoDB.MAX_INCREASE_NUM_PER_TABLE) {

          console.error(`The table '${table}' capacity increase count exceeded ${this._increasedFor[table]}`);
          originalCb(originalError, data);
          return;
        }

        let throughput = dynamoDBThroughput(table, {
          endpoint: this._dynamoDb.config.endpoint,
          region: this._dynamoDb.config.region,
          credentials: this._dynamoDb.config.credentials,
        });

        throughput.tableInfo((error, info) => {
          if (error) {
            console.error(`Failed on gather information about table '${table}': ${error}`);

            originalCb(originalError, data);
            return;
          }

          let increasePayload = {};
          let increaseType = AutoScaleDynamoDB.increaseType(method);
          increasePayload[increaseType] = Math.ceil(parseInt(info.main[increaseType]) *
            AutoScaleDynamoDB.PROVISION_INCREASE_COEFFICIENT);

          throughput.setCapacity(increasePayload, (error) => {
            if (error) {
              if (this._isResourceInUseError(error)) {
                console.error(`'${table}' is already in use: ${error}`);

                setTimeout(
                  this._dynamoDbDocumentClient[method].bind(this),
                  500, // increasing IOPS runs ~ 500ms
                  payload, originalCb
                );

                return;
              }

              console.error(`Failed on increase throughput for table '${table}': ${error}`);
              originalCb(originalError, data);
              return;
            }

            this._increasedFor[table] = (this._increasedFor[table] || 0) + 1;

            console.log(`The table '${table}' throughput increased by ${increasePayload[increaseType]}`);
            this._dynamoDbDocumentClient[method](payload, originalCb);
          });
        });

        return;
      }

      originalCb(error, data);
    };
  }

  /**
   * @param {Error} error
   * @returns {String}
   * @private
   */
  _isResourceInUseError(error) {
    return error.name === 'ResourceInUseException';
  }

  /**
   * @param {String} method
   * @returns {String}
   */
  static increaseType(method) {
    let type = null;

    switch (method) {
      case 'get':
      case 'scan':
      case 'query':
        type = 'read';
        break;
      case 'put':
      case'delete':
      case 'update':
        type = 'write';
        break;
      default: throw new Error(`Unknown DynamoDB autoscale method '${method}'`);
    }

    return type;
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
      case 'get':
      case 'scan':
      case 'query':
      case 'put':
      case 'delete':
      case 'update':
        tableName = payload.TableName;
        break;
      default: throw new Error(`Unknown DynamoDB autoscale method '${method}'`);
    }

    return tableName;
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
      'get', 'scan', 'query',
      'put', 'delete', 'update',
    ];
  }

  /**
   * @returns {Number}
   */
  static get MAX_INCREASE_NUM_PER_TABLE() {
    return 3;
  }

  /**
   * @returns {Number}
   */
  static get PROVISION_INCREASE_COEFFICIENT() {
    return 1.3;
  }

  /**
   * @returns {String}
   */
  static get DEEP_DB_DECORATOR_FLAG() {
    return '__deep_db_decorator__';
  }

  /**
   * @see https://github.com/aws/aws-sdk-js/blob/master/apis%2Fdynamodb-2012-08-10.normal.json
   * @returns {String}
   */
  static get THROUGHPUT_EXCEEDED_ERROR() {
    return 'ProvisionedThroughputExceededException';
  }
}
