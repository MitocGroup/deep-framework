/**
 * Created by vcernomschi on 11/30/15.
 */

'use strict';

export class CognitoIdentityMock {
  constructor(mode = CognitoIdentityMock.NO_RESULT_MODE, methods = CognitoIdentityMock.METHODS) {
    this._methodsBehavior = new Map();

    //set data mode as initial values
    this.setMode(CognitoIdentityMock.DATA_MODE);

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
      case CognitoIdentityMock.NO_RESULT_MODE:
        callback(null, null);
        break;

      case CognitoIdentityMock.FAILURE_MODE:
        callback(CognitoIdentityMock.ERROR, null);
        break;

      case CognitoIdentityMock.DATA_MODE:
        callback(null, CognitoIdentityMock.DATA);
        break;
    }
  }

  /**
   * @param {String} identityId
   * @param {Function} callback
   * @returns {CognitoIdentityMock}
   */
  describeIdentity(identityId, callback) {
    this.getCallbackByMode(this._methodsBehavior.get('describeIdentity'), callback);

    return this;
  }

  /**
   * Set mode for passed methods
   * @param {Number} mode
   * @param {String[]} methods
   */
  setMode(mode = CognitoIdentityMock.NO_RESULT_MODE, methods = CognitoIdentityMock.METHODS) {

    if (CognitoIdentityMock.MODES.indexOf(mode) < 0) {
      mode = CognitoIdentityMock.NO_RESULT_MODE;
    }

    for (let method of methods) {
      if (CognitoIdentityMock.METHODS.indexOf(method) < 0) {
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
      CognitoIdentityMock.NO_RESULT_MODE,
      CognitoIdentityMock.FAILURE_MODE,
      CognitoIdentityMock.DATA_MODE,
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
      data: 'Test _identityMetadata',
      Logins: [
        {firstLogin: '1st test login'},
        {secondLogin: '2nd test login'},
      ]
    };
  }

  /**
   * @returns {string[]}
   * @constructor
   */
  static get METHODS() {
    return [
      'describeIdentity',
    ];
  }
}
