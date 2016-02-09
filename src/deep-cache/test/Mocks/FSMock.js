'use strict';


/**
 * Dynalite Server Mock, as singleton
 */
let instance = null;

class FSMock {
  constructor() {
    if(!instance){
      this._methodsBehavior = new Map();
      this.setMode(FSMock.NO_RESULT_MODE);

      instance = this;
    }

    return instance;
  }

  /**
   * Returns callback for method based on behavior from _methodsBehavior map
   * @param {String} mode
   * @param {Function} callback
   */
  getCallbackByMode(mode, callback) {
    switch (mode) {
      case FSMock.NO_RESULT_MODE:
        callback(null, FSMock.EMPTY_OBJECT);
        break;

      case FSMock.FAILURE_MODE:
        callback(FSMock.ERROR, null);
        break;

      case FSMock.EXCEPTION_MODE:
        callback(null, FSMock.TO_THROW_EXCEPTION);
        break;

      case FSMock.DATA_MODE:
        callback(null, FSMock.DATA);
        break;

      case FSMock.UPDATE_MODE:
        callback(null, FSMock.UPDATED_DATA);
        break;
    }
  }

  /**
   * @param {String} key
   * @param {Function} callback
   * @returns {FSMock}
   * @private
   */
  readFile(key, callback = null) {
    this.getCallbackByMode(this._methodsBehavior.get('readFile'), callback);

    return this;
  }

  /**
   * @param {String} key
   * @param {Function} callback
   * @returns {FSMock}
   * @private
   */
  unlink(key, callback = null) {
    this.getCallbackByMode(this._methodsBehavior.get('unlink'), callback);

    return this;
  }


  /**
   * @param {String} directory
   * @param {Function} callback
   * @returns {*}
   */
  mkdirp(directory, callback) {
    this.getCallbackByMode(this._methodsBehavior.get('mkdirp'), callback);

    return this;
  }

  /**
   * @param {String} directory
   * @param {Object} strObject
   * @param {Function} callback
   * @returns {*}
   */
  writeFile(key, strObject, callback) {
    this.getCallbackByMode(this._methodsBehavior.get('writeFile'), callback);

    return this;
  }

  /**
   * Set mode for passed methods
   * @param {Number} mode
   * @param {String[]} methods
   */
  setMode(mode = FSMock.NO_RESULT_MODE, methods = FSMock.METHODS) {

    if (FSMock.MODES.indexOf(mode) < 0) {
      mode = FSMock.NO_RESULT_MODE;
    }

    for (let method of methods) {
      if (FSMock.METHODS.indexOf(method) < 0) {
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
  static get EXCEPTION_MODE() {
    return 2;
  }

  /**
   * @returns {number}
   * @constructor
   */
  static get DATA_MODE() {
    return 3;
  }

  /**
   * @returns {number}
   * @constructor
   */
  static get UPDATE_MODE() {
    return 4;
  }

  /**
   * @returns {string[]}
   * @constructor
   */
  static get MODES() {
    return [
      FSMock.NO_RESULT_MODE,
      FSMock.FAILURE_MODE,
      FSMock.EXCEPTION_MODE,
      FSMock.DATA_MODE,
      FSMock.UPDATE_MODE,
    ];
  }

  /**
   * @returns {{code: number, message: string}}
   * @constructor
   */
  static get TO_THROW_EXCEPTION() {
    return 'will throw exception to parse this';
  }

  /**
   * @returns {{code: number, message: string}}
   * @constructor
   */
  static get ERROR() {
    return '{"code":"500","data":"null","message":"Internal Error"}';
  }

  /**
   * @returns {{data: string}}
   * @constructor
   */
  static get DATA() {
    return '{"code":"200","value":"request successfully sent","buildId":""}';
  }

  /**
   * @returns {{data: string}}
   * @constructor
   */
  static get UPDATED_DATA() {
    return '{"code":"200","value":"request successfully sent and updated data","buildId":"testBuildId01234"}';
  }


  /**
   * @returns {string[]}
   * @constructor
   */
  static get METHODS() {
    return [
      'readFile',
      'unlink',
      'mkdirp',
      'writeFile',
    ];
  }
}

export default function() {
  return new FSMock();
}