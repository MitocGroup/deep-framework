/**
 * Created by vcernomschi on 11/30/15.
 */

'use strict';

export class CognitoSyncMock {
  constructor(mode = CognitoSyncMock.NO_RESULT_MODE, methods = CognitoSyncMock.METHODS) {
    this._methodsBehavior = new Map();

    //set data mode as initial values
    this.setMode(CognitoSyncMock.DATA_MODE);

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
      case CognitoSyncMock.NO_RESULT_MODE:
        callback(null, null);
        break;

      case CognitoSyncMock.FAILURE_MODE:
        callback(CognitoSyncMock.ERROR, null);
        break;

      case CognitoSyncMock.DATA_MODE:
        callback(null, CognitoSyncMock.DATA);
        break;
    }
  }

  /**
   * @param {String} datasetName
   * @param {Function} callback
   * @returns {CognitoSyncMock}
   */
  listRecords(datasetName, callback) {
    this.getCallbackByMode(this._methodsBehavior.get('listRecords'), callback);

    return this;
  }

  /**
   * Set mode for passed methods
   * @param {Number} mode
   * @param {String[]} methods
   */
  setMode(mode = CognitoSyncMock.NO_RESULT_MODE, methods = CognitoSyncMock.METHODS) {

    if (CognitoSyncMock.MODES.indexOf(mode) < 0) {
      mode = CognitoSyncMock.NO_RESULT_MODE;
    }

    for (let method of methods) {
      if (CognitoSyncMock.METHODS.indexOf(method) < 0) {
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
      CognitoSyncMock.NO_RESULT_MODE,
      CognitoSyncMock.FAILURE_MODE,
      CognitoSyncMock.DATA_MODE,
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
      Records: [
        {
          Key: 'session_creds_unmatch',
          Value: '{"token":"test2_session_creds"}',
        },
        {
          Key: 'session_creds',
          Value: '{"token":"test_session_creds"}',
        },
        {
          Key: 'session_creds_invalid',
          Value: '{"token":"test2_session_creds"}',
        },
      ],
    };
  }

  /**
   * @returns {string[]}
   * @constructor
   */
  static get METHODS() {
    return [
      'listRecords',
    ];
  }
}
