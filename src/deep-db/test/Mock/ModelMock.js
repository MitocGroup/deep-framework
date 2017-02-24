'use strict';

export class ModelMock {
  constructor() {
    this._methodsBehavior = new Map();
    this._deepQuery = null;

    this.setMode(ModelMock.NO_RESULT_MODE);
  }

  /**
   * Returns callback for method based on behavior from _methodsBehavior map
   * @param {String} method
   * @param {Function} callback
   */
  getCallbackByMethod(method, callback) {
    switch (method) {
      case ModelMock.NO_RESULT_MODE:
        callback(null, null);
        break;

      case ModelMock.FAILURE_MODE:
        callback(ModelMock.ERROR, null);
        break;

      case ModelMock.DATA_MODE:
        callback(null, ModelMock.DATA);
        break;

      case ModelMock.DATA_WITH_COUNT_MODE:
        callback(null, ModelMock.DATA_WITH_COUNT);
        break;
    }
  }

  scan() {
    return this;
  }

  loadAll() {
    return this;
  }

  startKey() {
    return this;
  }

  limit() {
    return this;
  }

  where() {
    return this;
  }

  equals() {
    return this;
  }

  filterExpression() {
    return this;
  }

  expressionAttributeValues() {
    return this;
  }

  expressionAttributeNames() {
    return this;
  }

  /**
   * @param id
   * @param {Function} callback
   * @returns {*}
   */
  get(id, callback) {
    this.getCallbackByMethod(this._methodsBehavior.get('get'), callback);

    return this;
  }

  /**
   * @param {Function} callback
   * @returns {ModelMock}
   */
  exec(callback) {
    this.getCallbackByMethod(this._methodsBehavior.get('exec'), callback);

    return this;
  }

  /**
   * @param id
   * @param {Function} callback
   * @returns {*}
   */
  destroy(id, callback) {
    this.getCallbackByMethod(this._methodsBehavior.get('destroy'), callback);

    return this;
  }

  /**
   * @param {Object} data
   * @param {Function} callback
   * @returns {ModelMock}
   */
  create(data, callback) {
    this.getCallbackByMethod(this._methodsBehavior.get('create'), callback);

    return this;
  }

  /**
   * @param {Object} data
   * @param {Function} callback
   * @returns {ModelMock}
   */
  update(data, callback) {
    this.getCallbackByMethod(this._methodsBehavior.get('update'), callback);

    return this;
  }

  /**
   * Set mode for passed methods
   * @param {Number} mode
   * @param {String[]} methods
   */
  setMode(mode = ModelMock.NO_RESULT_MODE, methods = ModelMock.METHODS) {

    if (ModelMock.MODES.indexOf(mode) < 0) {
      mode = ModelMock.NO_RESULT_MODE;
    }

    for (let method of methods) {
      if (ModelMock.METHODS.indexOf(method) < 0) {
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
   * @returns {number}
   * @constructor
   */
  static get DATA_WITH_COUNT_MODE() {
    return 3;
  }

  /**
   * @returns {string[]}
   * @constructor
   */
  static get MODES() {
    return [
      ModelMock.NO_RESULT_MODE,
      ModelMock.FAILURE_MODE,
      ModelMock.DATA_MODE,
      ModelMock.DATA_WITH_COUNT_MODE,
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
      Items: [],
    };
  }

  /**
   * @returns {string}
   * @constructor
   */
  static get DATA_WITH_COUNT() {
    return {
      status: 200,
      message: 'Operation successfully proccessed',
      Count: true,
      Items: [],
    };
  }

  /**
   * @returns {string[]}
   * @constructor
   */
  static get METHODS() {
    return [
      'get',
      'exec',
      'destroy',
      'create',
      'update',
    ];
  }
}
