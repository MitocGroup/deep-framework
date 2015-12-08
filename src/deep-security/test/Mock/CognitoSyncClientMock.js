/**
 * Created by vcernomschi on 11/23/15.
 */

'use strict';

import {Dataset} from './Dataset';

export class CognitoSyncClientMock {
  constructor() {
    this._methodsBehavior = new Map();

    this.setMode(CognitoSyncClientMock.NO_RESULT_MODE);
  }

  /**
   * Returns callback for method based on behavior from _methodsBehavior map
   * @param {String} mode
   * @param {Function} callback
   */
  getCallbackByMode(mode, callback) {
    switch (mode) {
      case CognitoSyncClientMock.NO_RESULT_MODE:
        callback(null, null);
        break;

      case CognitoSyncClientMock.FAILURE_MODE:
        callback(CognitoSyncClientMock.ERROR, null);
        break;

      case CognitoSyncClientMock.DATA_MODE_WITH_ERROR_IN_PUT_DATASET:
        callback(null, new Dataset(Dataset.FAILURE_MODE, ['put']));
        break;

      case CognitoSyncClientMock.DATA_MODE_WITH_ERROR_IN_SYNCHRONIZE_DATASET:
        callback(null, new Dataset(Dataset.FAILURE_MODE, ['synchronize']));
        break;

      case CognitoSyncClientMock.DATA_MODE_WITH_DATA_IN_PUT_DATASET:
        callback(null, new Dataset(Dataset.DATA_MODE, ['put']));
        break;

      case CognitoSyncClientMock.DATA_MODE_WITH_DATA_IN_SYNCHRONIZE_DATASET:
        callback(null, new Dataset(Dataset.DATA_MODE, ['synchronize']));
        break;

      case CognitoSyncClientMock.DATA_MODE:
        callback(null, new Dataset(Dataset.DATA_MODE));
        break;
    }
  }

  /**
   * @param {String} datasetName
   * @param {Function} callback
   * @returns {CognitoSyncClientMock}
   */
  openOrCreateDataset(datasetName, callback) {
    this.getCallbackByMode(this._methodsBehavior.get('openOrCreateDataset'), callback);

    return this;
  }

  /**
   * Set mode for passed methods
   * @param {Number} mode
   * @param {String[]} methods
   */
  setMode(mode = CognitoSyncClientMock.NO_RESULT_MODE, methods = CognitoSyncClientMock.METHODS) {

    if (CognitoSyncClientMock.MODES.indexOf(mode) < 0) {
      mode = CognitoSyncClientMock.NO_RESULT_MODE;
    }

    for (let method of methods) {
      if (CognitoSyncClientMock.METHODS.indexOf(method) < 0) {
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
  static get DATA_MODE_WITH_ERROR_IN_PUT_DATASET() {
    return 2;
  }

  /**
   * @returns {number}
   * @constructor
   */
  static get DATA_MODE_WITH_ERROR_IN_SYNCHRONIZE_DATASET() {
    return 3;
  }

  /**
   * @returns {number}
   * @constructor
   */
  static get DATA_MODE_WITH_DATA_IN_PUT_DATASET() {
    return 4;
  }

  /**
   * @returns {number}
   * @constructor
   */
  static get DATA_MODE_WITH_DATA_IN_SYNCHRONIZE_DATASET() {
    return 5;
  }

  /**
   * @returns {number}
   * @constructor
   */
  static get DATA_MODE() {
    return 6;
  }

  /**
   * @returns {string[]}
   * @constructor
   */
  static get MODES() {
    return [
      CognitoSyncClientMock.NO_RESULT_MODE,
      CognitoSyncClientMock.FAILURE_MODE,
      CognitoSyncClientMock.DATA_MODE_WITH_ERROR_IN_PUT_DATASET,
      CognitoSyncClientMock.DATA_MODE_WITH_ERROR_IN_SYNCHRONIZE_DATASET,
      CognitoSyncClientMock.DATA_MODE_WITH_DATA_IN_PUT_DATASET,
      CognitoSyncClientMock.DATA_MODE_WITH_DATA_IN_SYNCHRONIZE_DATASET,
      CognitoSyncClientMock.DATA_MODE,
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
   * @returns {string[]}
   * @constructor
   */
  static get METHODS() {
    return [
      'openOrCreateDataset',
    ];
  }
}
