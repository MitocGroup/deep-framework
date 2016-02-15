'use strict';

import {ConsoleDriver} from '../../lib/Driver/ConsoleDriver';

/**
 * Console native logging
 */
export class ConsoleDriverMock extends ConsoleDriver {

  constructor() {
    super();
    this._console = ConsoleDriverMock.nativeConsole;
    this.logs = [];
  }

  /**
   * @returns {Object}
   */
  static get nativeConsole() {
    return {

      error: function(message, options, callback) {

        return {
          message: message,
          options: options,
          callback: callback,
        };
      },

      log: function(message, options, callback) {

        return {
          log: message,
          options: options,
          callback: callback,
        };
      },

      warn: function(message, options, callback) {

        return {
          warning: message,
          options: options,
          callback: callback,
        };
      },

      info: function(message, options, callback) {

        return {
          info: message,
          options: options,
          callback: callback,
        };
      },

      debug: function(message, options, callback) {

        return {
          debug: message,
          options: options,
          callback: callback,
        };
      },
    };
  }

  /**
   * @param {String} msg
   * @param {String} level
   * @param {*} context
   */
  log(msg, level, context) {
    super.log(msg, level, context);
    this.logs.push(arguments);
  }

  /**
   * @returns {ConsoleDriverMock}
   */
  overrideNative() {
    return this;
  }
}
