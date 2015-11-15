'use strict';

import {ConsoleDriver} from '../../lib.compiled/Driver/ConsoleDriver';

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
        };
      },

      log: function(message, options, callback) {

        return {
          log: message,
        };
      },

      warn: function(message, options, callback) {

        return {
          warning: message,
        };
      },

      info: function(message, options, callback) {

        return {
          info: message,
        };
      },

      debug: function(message, options, callback) {

        return {
          debug: message,
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
}
