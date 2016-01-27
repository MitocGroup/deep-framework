/**
 * Created by vcernomschi on 11/23/15.
 */

'use strict';

export class Dataset {
  /**
   *
   * @param {String} mode
   * @param {String[]}methods
   * @param {Function} callback
   */
  constructor(mode = Dataset.NO_RESULT_MODE, methods = Dataset.METHODS, callback) {
    this._methodsBehavior = new Map();

    //set data mode as initial values
    this.setMode(Dataset.DATA_MODE);

    //set mode based on args
    this.setMode(mode, methods);

    //set cb to be able to check if it will be called
    this.cb = callback;
  }

  /**
   * Returns callback for method based on behavior from _methodsBehavior map
   * @param {String} mode
   * @param {Function} callback
   */
  getCallbackByMode(mode, callback) {
    switch (mode) {
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
  put(recordName, credentials, callback) {
    this.getCallbackByMode(this._methodsBehavior.get('put'), callback);

    return this;
  }

  /**
   * @param {Conflict[]} resolved
   * @param {Function} callback
   * @returns {Dataset}
   */
  resolve(resolved, callback) {
    callback(true);

    return this;
  }

  /**
   * @param {Object} datasetModeImpl
   * @returns {Dataset}
   */
  synchronize(datasetModeImpl) {
    switch (this._methodsBehavior.get('synchronize')) {
      case Dataset.NO_RESULT_MODE:
        //no behavior for this mode in synchronize
        break;

      case Dataset.FAILURE_MODE:
        datasetModeImpl.onFailure(this, Dataset.ERROR);
        break;

      case Dataset.DATA_MODE:
        datasetModeImpl.onSuccess(this, Dataset.DATA);
        break;

      case Dataset.SYNCRONIZE_CONFLICT_MODE:
        datasetModeImpl.onConflict(this, [], this.cb);
        break;

      case Dataset.SYNCRONIZE_DATASET_DELETED_MODE:
        datasetModeImpl.onDatasetDeleted(this, 'DeletedDatasetName', this.cb);
        break;

      case Dataset.SYNCRONIZE_DATASET_MERGED_MODE:
        datasetModeImpl.onDatasetMerged(this, 'DeletedMergedName', this.cb);
        break;
    }

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
  static get SYNCRONIZE_CONFLICT_MODE() {
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
  static get SYNCRONIZE_DATASET_DELETED_MODE() {
    return 4;
  }

  /**
   * @returns {number}
   * @constructor
   */
  static get SYNCRONIZE_DATASET_MERGED_MODE() {
    return 5;
  }

  /**
   * @returns {string[]}
   * @constructor
   */
  static get MODES() {
    return [
      Dataset.NO_RESULT_MODE,
      Dataset.FAILURE_MODE,
      Dataset.SYNCRONIZE_CONFLICT_MODE,
      Dataset.DATA_MODE,
      Dataset.SYNCRONIZE_DATASET_DELETED_MODE,
      Dataset.SYNCRONIZE_DATASET_MERGED_MODE,
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