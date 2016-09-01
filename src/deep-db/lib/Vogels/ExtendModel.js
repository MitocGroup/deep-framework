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
        return _this.model.scan().loadAll().exec(cb);
      },

      findAllPaginated: function(startKey, limit, cb) {
        return _this.model
          .scan()
          .startKey(startKey)
          .limit(limit)
          .exec(cb);
      },

      findOneById: function(id, cb) {
        return _this.model.get(id, cb);
      },

      findOneBy: function(fieldName, value, cb) {
        return _this.model
          .scan()
          .where(fieldName).equals(value)
          .exec(cb);
      },

      findBy: function(fieldName, value, cb, limit = ExtendModel.DEFAULT_LIMIT) {
        return _this.model
          .scan()
          .where(fieldName).equals(value)
          .limit(limit)
          .exec(cb);
      },

      findAllBy: function(fieldName, value, cb) {
        return _this.model
          .scan()
          .where(fieldName).equals(value)
          .loadAll()
          .exec(cb);
      },

      findAllByPaginated: function(fieldName, value, startKey, limit, cb) {
        return _this.model
          .scan()
          .where(fieldName).equals(value)
          .startKey(startKey)
          .limit(limit)
          .exec(cb);
      },

      findMatching: function(params, cb, limit = ExtendModel.DEFAULT_LIMIT) {
        let scanParams = ExtendModel.buildScanParameters(params);

        return _this.model
          .scan()
          .filterExpression(scanParams.filterExpression)
          .expressionAttributeValues(scanParams.filterExpressionValues)
          .expressionAttributeNames(scanParams.filterExpressionNames)
          .limit(limit)
          .exec(cb);
      },

      findOneMatching: function(params, cb) {
        let scanParams = ExtendModel.buildScanParameters(params);

        return _this.model
          .scan()
          .filterExpression(scanParams.filterExpression)
          .expressionAttributeValues(scanParams.filterExpressionValues)
          .expressionAttributeNames(scanParams.filterExpressionNames)
          .limit(1)
          .exec(cb);
      },

      findAllMatching: function(params, cb) {
        let scanParams = ExtendModel.buildScanParameters(params);

        return _this.model
          .scan()
          .filterExpression(scanParams.filterExpression)
          .expressionAttributeValues(scanParams.filterExpressionValues)
          .expressionAttributeNames(scanParams.filterExpressionNames)
          .loadAll()
          .exec(cb);
      },

      findAllMatchingPaginated: function(params, startKey, limit, cb) {
        let scanParams = ExtendModel.buildScanParameters(params);

        return _this.model
          .scan()
          .filterExpression(scanParams.filterExpression)
          .expressionAttributeValues(scanParams.filterExpressionValues)
          .expressionAttributeNames(scanParams.filterExpressionNames)
          .startKey(startKey)
          .limit(limit)
          .exec(cb);
      },

      findItems: function(...args) {
        return _this.model.getItems(...args);
      },

      deleteById: function(id, cb) {
        return _this.model.destroy(id, cb);
      },

      deleteByIdConditional: function(id, condition, cb) {
        return _this.model.destroy(id, condition, cb);
      },

      createItem: function(data, cb) {
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
          .scan()
          .filterExpression(scanParams.filterExpression)
          .expressionAttributeValues(scanParams.filterExpressionValues)
          .expressionAttributeNames(scanParams.filterExpressionNames)
          .limit(1)
          .exec(scanCb);
      },

      updateItem: function(id, data, cb) {
        data.Id = id;

        return _this.model.update(data, cb);
      },

      updateItemConditional: function(id, data, condition, cb) {
        data.Id = id;

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
}
