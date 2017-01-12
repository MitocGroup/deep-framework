/**
 * Created by Stefan Hariton on 6/26/15.
 */

'use strict';

import {UndefinedMethodException} from './Exceptions/UndefinedMethodException';
import crypto from 'crypto';

/**
 * Extends standard Vogels models
 */
export class ExtendModel {
  /**
   * @param {Object} model
   */
  constructor(model) {
    this._model = model;

    this._registerQueryWrappers();
  }

  /**
   * @returns {ExtendModel}
   * @private
   */
  _registerQueryWrappers() {
    this._model.setPartition = function(partion) {
      this[ExtendModel.PARTITION_KEY] = partion;
    };

    this._model.getPartition = function() {
      if (this.hasOwnProperty(ExtendModel.ONE_TIME_PARTITION_KEY)) {
        let partition = this[ExtendModel.ONE_TIME_PARTITION_KEY];

        delete this[ExtendModel.ONE_TIME_PARTITION_KEY];

        return partition;
      } else if (this.hasOwnProperty(ExtendModel.PARTITION_KEY)) {
        return this[ExtendModel.PARTITION_KEY];
      }

      return null;
    };

    this._model.hasPartition = function() {
      return this.hasOwnProperty(ExtendModel.ONE_TIME_PARTITION_KEY) ||
          this.hasOwnProperty(ExtendModel.PARTITION_KEY);
    };

    this._model.useAnonymous = function() {
      this[ExtendModel.ONE_TIME_PARTITION_KEY] = ExtendModel.ANONYMOUS_PARTITION;

      return this;
    };

    this._model.deepQuery = function(requestStrategy = ExtendModel.QUERY_STRATEGY) {
      if (this.hasPartition()) {
        switch (requestStrategy) {
          case ExtendModel.SCAN_STRATEGY:
            return this.scan().where(ExtendModel.PARTITION_FIELD).equals(this.getPartition());
          case ExtendModel.QUERY_STRATEGY:
            return this.query(this.getPartition());
        }
      } else {
        return this.scan();
      }
    };

    this._model.anonymousQuery = function() {
      return this.query(ExtendModel.ANONYMOUS_PARTITION);
    };

    return this;
  }

  /**
   * @returns {Object}
   */
  get model() {
    return this._model;
  }

  /**
   * @returns {Number}
   */
  static get DEFAULT_LIMIT() {
    return 10;
  }

  /**
   * @returns {number}
   */
  static get DEFAULT_SEGMENTS_NUMBER() {
    return 4;
  }

  /**
   * Makes filterExpression, filtersExpressionValues and filterExpressionNames from an object, that are used to make
   * a DynamoDb scan
   *
   * @param {Object} params
   * @returns {Object}
   */
  static buildScanParameters(params) {
    let filterExpression = '';
    let filterExpressionValues = {};
    let filterExpressionNames = {};
    let first = true;

    for (let key in params) {
      if (!params.hasOwnProperty(key)) {
        continue;
      }

      let fieldValue = params[key];

      let fieldName = `#${key}`;
      let fieldValueName = `:${key}`;

      if (!first) {
        filterExpression += ' AND ';
      }

      filterExpression += `${fieldName} = ${fieldValueName}`;
      filterExpressionValues[fieldValueName] = fieldValue;
      filterExpressionNames[fieldName] = key;
      first = false;
    }

    return {
      filterExpression: filterExpression,
      filterExpressionValues: filterExpressionValues,
      filterExpressionNames: filterExpressionNames,
    };
  }

  /**
   * @returns {Object}
   */
  get methods() {
    let _this = this;

    return {


      findAll: function(cb) {
        return _this.model.deepQuery().loadAll().exec(cb);
      },

      findAllPaginated: function(startKey, limit, cb) {
        return _this.model
          .deepQuery()
          .startKey(startKey)
          .limit(limit)
          .exec(cb);
      },

      findOneById: function(id, cb) {
        return _this.model.hasPartition() ?
          _this.model.get(this.getPartition(), id, cb) :
          _this.model.get(id, cb);
      },

      findOneBy: function(fieldName, value, cb) {
        return _this.model
          .deepQuery(ExtendModel.SCAN_STRATEGY)
          .where(fieldName).equals(value)
          .exec(cb);
      },

      findBy: function(fieldName, value, cb, limit = ExtendModel.DEFAULT_LIMIT) {
        return _this.model
          .deepQuery(ExtendModel.SCAN_STRATEGY)
          .where(fieldName).equals(value)
          .limit(limit)
          .exec(cb);
      },

      findAllBy: function(fieldName, value, cb) {
        return _this.model
          .deepQuery()
          .where(fieldName).equals(value)
          .loadAll()
          .exec(cb);
      },

      findAllByPaginated: function(fieldName, value, startKey, limit, cb) {
        return _this.model
          .deepQuery()
          .where(fieldName).equals(value)
          .startKey(startKey)
          .limit(limit)
          .exec(cb);
      },

      findMatching: function(params, cb, limit = ExtendModel.DEFAULT_LIMIT) {
        let scanParams = ExtendModel.buildScanParameters(params);

        return _this.model
          .deepQuery()
          .filterExpression(scanParams.filterExpression)
          .expressionAttributeValues(scanParams.filterExpressionValues)
          .expressionAttributeNames(scanParams.filterExpressionNames)
          .limit(limit)
          .exec(cb);
      },

      findOneMatching: function(params, cb) {
        let scanParams = ExtendModel.buildScanParameters(params);

        return _this.model
          .deepQuery()
          .filterExpression(scanParams.filterExpression)
          .expressionAttributeValues(scanParams.filterExpressionValues)
          .expressionAttributeNames(scanParams.filterExpressionNames)
          .limit(1)
          .exec(cb);
      },

      findAllMatching: function(params, cb) {
        let scanParams = ExtendModel.buildScanParameters(params);

        return _this.model
          .deepQuery()
          .filterExpression(scanParams.filterExpression)
          .expressionAttributeValues(scanParams.filterExpressionValues)
          .expressionAttributeNames(scanParams.filterExpressionNames)
          .loadAll()
          .exec(cb);
      },

      findAllMatchingPaginated: function(params, startKey, limit, cb) {
        let scanParams = ExtendModel.buildScanParameters(params);

        return _this.model
          .deepQuery()
          .filterExpression(scanParams.filterExpression)
          .expressionAttributeValues(scanParams.filterExpressionValues)
          .expressionAttributeNames(scanParams.filterExpressionNames)
          .startKey(startKey)
          .limit(limit)
          .exec(cb);
      },

      findItems: function(...args) {
        if (_this.model.hasPartition()) {
          let partition = _this.model.getPartition();
          let ids = args.shift();
          let composedIds = ids.map(id => {
            let idObj = {};

            idObj[ExtendModel.PARTITION_FIELD] = partition;
            idObj.Id = id;

            return idObj;
          });

          // concat with anonymous partition search
          if (partition !== ExtendModel.ANONYMOUS_PARTITION) {
            composedIds = composedIds.concat(ids.map(id => {
              let idObj = {};

              idObj[ExtendModel.PARTITION_FIELD] = ExtendModel.ANONYMOUS_PARTITION;
              idObj.Id = id;

              return idObj;
            }));
          }
          
          args.unshift(composedIds);
        }

        return _this.model.getItems(...args);
      },

      deleteById: function(id, cb) {
        return _this.model.hasPartition() ?
          _this.model.destroy(_this.model.getPartition(), id, cb) :
          _this.model.destroy(id, cb);
      },

      deleteByIdConditional: function(id, condition, cb) {
        return _this.model.destroy(id, condition, cb);
      },

      createItem: function(data, cb) {
        if (_this.model.hasPartition()) {
          data[ExtendModel.PARTITION_FIELD] = _this.model.getPartition();
        }

        return _this.model.create(data, cb);
      },

      createUniqueOnFields: function(fields, data, cb) {
        let scanCb = function(err, data) {
          if (err) {
            return cb(err, data);
          }

          if (data.Count) {
            return cb(`Item like ${data} already exists`);
          }

          return _this.model.create(data, cb);
        };

        let scanParams = {};
        for (let fieldKey in fields) {
          if (!fields.hasOwnProperty(fieldKey)) {
            continue;
          }

          let field = fields[fieldKey];

          scanParams[field] = data[field];
        }

        scanParams = ExtendModel.buildScanParameters(scanParams);

        return _this.model
          .deepQuery()
          .filterExpression(scanParams.filterExpression)
          .expressionAttributeValues(scanParams.filterExpressionValues)
          .expressionAttributeNames(scanParams.filterExpressionNames)
          .limit(1)
          .exec(scanCb);
      },

      updateItem: function(id, data, cb) {
        data.Id = id;

        if (_this.model.hasPartition()) {
          data[ExtendModel.PARTITION_FIELD] = _this.model.getPartition();
        }

        return _this.model.update(data, cb);
      },

      updateItemConditional: function(id, data, condition, cb) {
        data.Id = id;

        if (_this.model.hasPartition()) {
          data[ExtendModel.PARTITION_FIELD] = _this.model.getPartition();
        }

        return _this.model.update(data, condition, cb);
      },
    };
  }

  /**
   * Injects the specified methods or all
   * @param {Array} methods
   * @returns {Object|*}
   */
  inject(methods = null) {
    let predefinedMethods = this.methods;
    let predefinedMethodsNames = Object.keys(predefinedMethods);

    methods = methods || predefinedMethodsNames;

    for (let methodKey in methods) {
      if (!methods.hasOwnProperty(methodKey)) {
        continue;
      }

      let methodName = methods[methodKey];

      if (!predefinedMethods.hasOwnProperty(methodName)) {
        throw new UndefinedMethodException(methodName, predefinedMethodsNames);
      }

      this._model[methodName] = this._applyRumDecorator(predefinedMethods[methodName], methodName);
    }

    return this._model;
  }

  /**
   * @param {Object} customData
   * @returns {Boolean}
   * @private
   */
  _logRumEvent(customData) {
    if (!this.model.logService) {
      return false;
    }

    let event = Object.assign(customData, {
      service: 'deep-db',
      resourceType: 'DynamoDB',
      resourceId: this.model.tableName(),
    });

    this.model.logService.rumLog(event);

    return true;
  }

  /**
   * @param {Function} method
   * @param {String} eventName
   * @returns {Function}
   * @private
   */
  _applyRumDecorator(method, eventName) {
    return (...args) => {
      if (!this.model.logService) {
        return method(...args);
      }

      let cbIndex = null;

      for (let index in args) {
        if (args.hasOwnProperty(index) && typeof args[index] === 'function') {
          cbIndex = index;
        }
      }

      if (cbIndex === null) {
        return method(...args);
      }

      let startOpEvent = {
        eventName: eventName,
        time: Date.now(),
        eventId: ExtendModel.buildEventId(eventName),
      };

      this._logRumEvent(startOpEvent);

      let originalCb = args[cbIndex];

      args[cbIndex] = (...args) => {
        let endOpEvent = Object.assign({}, startOpEvent);
        endOpEvent.time = Date.now();

        this._logRumEvent(endOpEvent);

        originalCb(...args);
      };

      return method(...args);
    };
  }

  /**
   * @param {String} eventName
   * @returns {String}
   */
  static buildEventId(eventName) {
    var md5sum = crypto.createHash('md5');

    md5sum.update(JSON.stringify({
      namespace: 'DB|Vogels|ExtendModel',
      name: eventName,
      time: Date.now()
    }));

    return md5sum.digest('hex');
  }

  /**
   * @returns {String}
   */
  static get PARTITION_FIELD() {
    return 'AccountId';
  }

  /**
   * @returns {String}
   */
  static get ONE_TIME_PARTITION_KEY() {
    return 'oneTimeDeepPartitionKey';
  }

  /**
   * @returns {String}
   */
  static get PARTITION_KEY() {
    return 'deepPartitionKey';
  }

  /**
   * @returns {String}
   */
  static get ANONYMOUS_PARTITION() {
    return 'anonymous';
  }

  /**
   * @returns {String}
   */
  static get SCAN_STRATEGY() {
    return 'scan';
  }

  /**
   * @returns {String}
   */
  static get QUERY_STRATEGY() {
    return 'query';
  }
}
