/**
 * Created by vcernomschi on 11/23/15.
 */

'use strict';

export class DeepResourceServiceMock {
  constructor() {
    this._methodsBehavior = new Map();

    this.setMode(DeepResourceServiceMock.NO_RESULT_MODE);
  }

  /**
   * Returns callback for method based on behavior from _methodsBehavior map
   * @param {String} mode
   * @param {Function} callback
   */
  getCallbackByMode(mode, callback) {
    switch (mode) {
      case DeepResourceServiceMock.NO_RESULT_MODE:
        callback(null);
        break;

      case DeepResourceServiceMock.FAILURE_MODE:
        callback(DeepResourceServiceMock.ERROR);
        break;

      case DeepResourceServiceMock.DATA_MODE:
        callback(DeepResourceServiceMock.DATA);
        break;
    }
  }

  /**
   * @param {String} name
   * @returns {DeepResourceServiceMock}
   */
  get(name) {
    this.name = name;
    return this;
  }

  /**
   * @param {String} id
   * @returns {DeepResourceServiceMock}
   */
  request(id) {
    this.id = id;
    return this;
  }

  /**
   * @param {Function} callback
   * @returns {DeepResourceServiceMock}
   */
  send(callback) {
    this.getCallbackByMode(this._methodsBehavior.get('send'), callback);

    return this;
  }

  /**
   * Set mode for passed methods
   * @param {Number} mode
   * @param {String[]} methods
   */
  setMode(mode = DeepResourceServiceMock.NO_RESULT_MODE, methods = DeepResourceServiceMock.METHODS) {

    if (DeepResourceServiceMock.MODES.indexOf(mode) < 0) {
      mode = DeepResourceServiceMock.NO_RESULT_MODE;
    }

    for (let method of methods) {
      if (DeepResourceServiceMock.METHODS.indexOf(method) < 0) {
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
      DeepResourceServiceMock.NO_RESULT_MODE,
      DeepResourceServiceMock.FAILURE_MODE,
      DeepResourceServiceMock.DATA_MODE,
    ];
  }

  /**
   * @returns {string}
   * @constructor
   */
  static get ERROR() {
    return {
      code: 500,
      error: { message: 'RuntimeException'},
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
        Payload: '{"message":"User loaded successfully"}',
      },
    };
  }

  /**
   * @returns {string[]}
   * @constructor
   */
  static get METHODS() {
    return [
      'send',
    ];
  }
}