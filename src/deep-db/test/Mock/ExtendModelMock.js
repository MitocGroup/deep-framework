'use strict';

import {ExtendModel} from '../../lib.compiled/Vogels/ExtendModel';
import {Exception} from '../../lib.compiled/Vogels/Exceptions/Exception';
import {UndefinedMethodException} from '../../lib.compiled/Vogels/Exceptions/UndefinedMethodException';

export class ExtendModelMock extends ExtendModel {
  constructor(model) {
    super(model);

    this._methodsBehavior = new Map();

    this.setMode(ExtendModelMock.NO_RESULT_MODE);
  }

  /**
   * Returns callback for method based on behavior from _methodsBehavior map
   * @param {String} method
   * @param {Function} callback
   */
  getCallbackByMetod(method, callback) {
    switch (method) {
      case ExtendModelMock.NO_RESULT_MODE:
        callback(null, null);
        break;

      case ExtendModelMock.FAILURE_MODE:
        callback(ExtendModelMock.ERROR, null);
        break;

      case ExtendModelMock.DATA_MODE:
        callback(null, ExtendModelMock.DATA);
        break;
    }
  }

  scan() {
    return 'scanned';
  }

  loadAll() {
    return 'loaded';
  }

  exec(cb) {
    return cb(null, 'result');
  }

  startKey() {
    return 'startKey';
  }

  limit() {
    return 'limit';
  }

  where() {
    return 'where';
  }

  update(id, data) {
    return 'update';
  }

  create() {
    return 'create';
  }

  filterExpression() {
    return 'filterExpression';
  }

  expressionAttributeValues() {
    return 'expressionAttributeValues';
  }

  expressionAttributeNames() {
    return 'expressionAttributeNames';
  }

  throwException(message) {
    throw new Exception(message);
  }

  throwUndefinedMethodException(name, methods) {
    throw new UndefinedMethodException(name, methods);
  }

  /**
   * @param {Function} callback
   * @returns {ExtendModelMock}
   */
  exec(callback) {
    this.getCallbackByMetod(this._methodsBehavior.get('exec'), callback);

    return this;
  }

  /**
   * Set mode for passed methods
   * @param {Number} mode
   * @param {String[]} methods
   */
  setMode(mode = ExtendModelMock.NO_RESULT_MODE, methods = ExtendModelMock.METHODS) {

    if (ExtendModelMock.MODES.indexOf(mode) < 0) {
      mode = ExtendModelMock.NO_RESULT_MODE;
    }

    for (let method of methods) {
      if (ExtendModelMock.METHODS.indexOf(method) < 0) {
        continue;
      }

      this._methodsBehavior.set(method, mode);
    }
  }

  /**
   * @returns {number}
   * @constructor
   */
  static get NO_RESULT_MODE() {
    return 0;
  }

  /**
   * @returns {number}
   * @constructor
   */
  static get FAILURE_MODE() {
    return 1;
  }

  /**
   * @returns {number}
   * @constructor
   */
  static get DATA_MODE() {
    return 2;
  }

  /**
   * @returns {string[]}
   * @constructor
   */
  static get MODES() {
    return [
      ExtendModelMock.NO_RESULT_MODE,
      ExtendModelMock.FAILURE_MODE,
      ExtendModelMock.DATA_MODE,
    ];
  }

  /**
   * @returns {string}
   * @constructor
   */
  static get ERROR() {
    return {
      code: 500,
      message: 'Internal Error',
    };
  }

  /**
   * @returns {string}
   * @constructor
   */
  static get DATA() {
    return {
      status: 200,
      message: 'Operation successfully proccessed',
    };
  }

  /**
   * @returns {string[]}
   * @constructor
   */
  static get METHODS() {
    return [
      'exec',
    ];
  }
}
