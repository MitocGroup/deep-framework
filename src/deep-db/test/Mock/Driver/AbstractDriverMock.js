'use strict';

import {AbstractDriver} from '../../../lib/Local/Driver/AbstractDriver';
import {ServerTtsExceededException} from '../../../lib/Local/Driver/Exception/ServerTtsExceededException';

export class AbstractDriverMock extends AbstractDriver {
  constructor() {
    super();

    this._methodsBehavior = new Map();

    this.setMode(AbstractDriverMock.NO_RESULT_MODE);
  }

  /**
   * Returns callback for method based on behavior from _methodsBehavior map
   * @param {String} method
   * @param {Function} callback
   */
  getCallbackByMethod(method, callback) {
    switch (method) {
      case AbstractDriverMock.NO_RESULT_MODE:
        callback(null, null);
        break;

      case AbstractDriverMock.FAILURE_MODE:
        callback(AbstractDriverMock.ERROR, null);
        break;

      case AbstractDriverMock.DATA_MODE:
        callback(null, AbstractDriverMock.DATA);
        break;
    }
  }

  /**
   * @param {Function} callback
   * @returns {AbstractDriverMock}
   */
  _start(callback) {
    this.getCallbackByMethod(this._methodsBehavior.get('_start'), callback);

    return this;
  }

  /**
   * @param {Function} callback
   * @returns {AbstractDriverMock}
   */
  _stop(callback) {
    this.getCallbackByMethod(this._methodsBehavior.get('_stop'), callback);

    return this;
  }

  /**
   * @param {AbstractDriver} driver
   * @param {Number} tts
   */
  throwServerTtsExceededException(driver, tts) {
    throw new ServerTtsExceededException(driver, tts);
  }

  /**
   * Set mode for passed methods
   * @param {Number} mode
   * @param {String[]} methods
   */
  setMode(mode = AbstractDriverMock.NO_RESULT_MODE, methods = AbstractDriverMock.METHODS) {

    if (AbstractDriverMock.MODES.indexOf(mode) < 0) {
      mode = AbstractDriverMock.NO_RESULT_MODE;
    }

    for (let method of methods) {
      if (AbstractDriverMock.METHODS.indexOf(method) < 0) {
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
      AbstractDriverMock.NO_RESULT_MODE,
      AbstractDriverMock.FAILURE_MODE,
      AbstractDriverMock.DATA_MODE,
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
      '_start',
      '_stop',
    ];
  }
}
