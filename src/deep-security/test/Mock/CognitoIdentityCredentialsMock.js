/**
 * Created by vcernomschi on 12/07/15.
 */

'use strict';

export class CognitoIdentityCredentialsMock {
  constructor(mode = CognitoIdentityCredentialsMock.NO_RESULT_MODE, methods = CognitoIdentityCredentialsMock.METHODS) {

    this._methodsBehavior = new Map();

    //set data mode as initial values
    this.setMode(CognitoIdentityCredentialsMock.DATA_MODE);

    //set mode based on args
    this.setMode(mode, methods);
  }

  /**
   * Returns callback for method based on behavior from _methodsBehavior map
   * @param {String} mode
   * @param {Function} callback
   */
  getCallbackByMode(mode, callback) {
    switch (mode) {
      case CognitoIdentityCredentialsMock.NO_RESULT_MODE:
        callback(null, null);
        break;

      case CognitoIdentityCredentialsMock.FAILURE_MODE:
        callback(CognitoIdentityCredentialsMock.ERROR, null);
        break;

      case CognitoIdentityCredentialsMock.DATA_MODE:
        callback(null, CognitoIdentityCredentialsMock.DATA);
        break;
    }
  }

  /**
   * @param {String} datasetName
   * @param {Function} callback
   * @returns {CognitoIdentityCredentialsMock}
   */
  refresh(callback) {
    this.getCallbackByMode(this._methodsBehavior.get('refresh'), callback);

    return this;
  }

  /**
   * Set mode for passed methods
   * @param {Number} mode
   * @param {String[]} methods
   */
  setMode(mode = CognitoIdentityCredentialsMock.NO_RESULT_MODE, methods = CognitoIdentityCredentialsMock.METHODS) {

    if (CognitoIdentityCredentialsMock.MODES.indexOf(mode) < 0) {
      mode = CognitoIdentityCredentialsMock.NO_RESULT_MODE;
    }

    for (let method of methods) {
      if (CognitoIdentityCredentialsMock.METHODS.indexOf(method) < 0) {
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
      CognitoIdentityCredentialsMock.NO_RESULT_MODE,
      CognitoIdentityCredentialsMock.FAILURE_MODE,
      CognitoIdentityCredentialsMock.DATA_MODE,
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
      data: {message: 'Succe'},
    };
  }

  /**
   * @returns {string[]}
   * @constructor
   */
  static get METHODS() {
    return [
      'refresh',
    ];
  }
}
