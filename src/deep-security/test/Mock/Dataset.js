/**
 * Created by vcernomschi on 11/23/15.
 */

'use strict';

export class Dataset {
  constructor(mode = Dataset.NO_RESULT_MODE, methods = Dataset.METHODS) {
    this._methodsBehavior = new Map();

    //set data mode as initial values
    this.setMode(Dataset.DATA_MODE);

    console.log('default set mode: ', mode)

    //set mode based on args
    this.setMode(mode, methods);
  }

  /**
   * Returns callback for method based on behavior from _methodsBehavior map
   * @param {String} method
   * @param {Function} callback
   */
  getCallbackByMethod(method, callback) {
    switch (method) {
      case Dataset.NO_RESULT_MODE:
        callback(null, null);
        break;

      case Dataset.FAILURE_MODE:
        callback(Dataset.ERROR, null);
        break;

      case Dataset.DATA_MODE:
        callback(null, Dataset.DATA);
        break;
    }
  }

  /**
   * @param {String} recordName
   * @param {String} credentials
   * @param {Function} callback
   * @returns {Dataset}
   */
  put(recordName, credentials ,callback) {
    this.getCallbackByMethod(this._methodsBehavior.get('put'), callback);

    return this;
  }

  /**
   * @param {Object} object
   * @returns {Dataset}
   */
  synchronize(object) {
    console.log('object', object);

    //this.getCallbackByMethod(this._methodsBehavior.get('synchronize'), callback);

    return this;
  }

  /**
   * Set mode for passed methods
   * @param {Number} mode
   * @param {String[]} methods
   */
  setMode(mode = Dataset.NO_RESULT_MODE, methods = Dataset.METHODS) {

    if (Dataset.MODES.indexOf(mode) < 0) {
      mode = Dataset.NO_RESULT_MODE;
    }

    for (let method of methods) {
      if (Dataset.METHODS.indexOf(method) < 0) {
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
      Dataset.NO_RESULT_MODE,
      Dataset.FAILURE_MODE,
      Dataset.DATA_MODE,
    ];
  }

  /**
   * @returns {string}
   * @constructor
   */
  static get ERROR() {
    return {
      code: 500,
      error: {message: 'RuntimeException'},
    };
  }

  /**
   * @returns {string}
   * @constructor
   */
  static get DATA() {
    return {
      code: 200,
      data: {
        Payload: 'Dataset successful response',
      },
    };
  }

  /**
   * @returns {string[]}
   * @constructor
   */
  static get METHODS() {
    return [
      'put',
      'synchronize',
    ];
  }
}