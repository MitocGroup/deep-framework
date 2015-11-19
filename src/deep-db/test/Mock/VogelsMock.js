'use strict';

export class VogelsMock {
  constructor() {

    this.AWS = {
      config: {
        maxRetries: 1,
      },

      DynamoDB: (options ={}) => {
        this._dynamoDB.options = options;

        return this;
      },

      Endpoint: (options = {}) => {
        this._dynamoDB = {
          endpoint: options,
        };

        return options;
      },
    };

    this._driver = null;

    this._methodsBehavior = new Map();

    this.setMode(VogelsMock.NO_RESULT_MODE);
  }

  /**
   * Returns callback for method based on behavior from _methodsBehavior map
   * @param {String} method
   * @param {Function} callback
   */
  getCallbackByMetod(method, callback) {
    switch (method) {
      case VogelsMock.NO_RESULT_MODE:
        callback(null, null);
        break;

      case VogelsMock.FAILURE_MODE:
        callback(VogelsMock.ERROR, null);
        break;

      case VogelsMock.DATA_MODE:
        callback(null, VogelsMock.DATA);
        break;
    }
  }

  /**
   * @param {Object} options
   * @param {Function} callback
   * @returns {VogelsMock}
   */
  createTables(options, callback) {
    this.getCallbackByMetod(this._methodsBehavior.get('createTables'), callback);

    return this;
  }

  /**
   * @param driver
   * @returns {VogelsMock}
   */
  dynamoDriver(driver) {
    this._driver = driver;

    return this;
  }

  /**
   * @returns {null|*}
   */
  get driver() {
    return this._driver;
  }

  /**
   * @returns {{}|*}
   */
  get dynamoDB() {
    return this._dynamoDB;
  }

  /**
   * Set mode for passed methods
   * @param {Number} mode
   * @param {String[]} methods
   */
  setMode(mode = VogelsMock.NO_RESULT_MODE, methods = VogelsMock.METHODS) {

    if (VogelsMock.MODES.indexOf(mode) < 0) {
      mode = VogelsMock.NO_RESULT_MODE;
    }

    for (let method of methods) {
      if (VogelsMock.METHODS.indexOf(method) < 0) {
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
      VogelsMock.NO_RESULT_MODE,
      VogelsMock.FAILURE_MODE,
      VogelsMock.DATA_MODE,
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
      status:200,
      message: 'Operation successfully proccessed',
    };
  }

  /**
   * @returns {string[]}
   * @constructor
   */
  static get METHODS() {
    return [
      'createTables',
      'dynamoDriver',
    ];
  }

  fixBabelTranspile() {
    for (let method of VogelsMock.METHODS) {
      Object.defineProperty(this, method, {
        value: this[method],
        writable: false,
      });
    }
  }
}