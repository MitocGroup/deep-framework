/**
 * Created by AlexanderC on 6/15/15.
 */

'use strict';

import {AbstractDriver} from './AbstractDriver';
import {Log} from '../Log';

/**
 * Console native logging
 */
export class ConsoleDriver extends AbstractDriver {
  constructor() {
    super();

    this._console = ConsoleDriver._buildConsole();
  }

  /**
   * @returns {Object}
   * @private
   */
  static _buildConsole() {
    let nativeConsole = ConsoleDriver.nativeConsole;
    let console = {};

    for (let i in ConsoleDriver.METHODS_TO_OVERRIDE) {
      if (!ConsoleDriver.METHODS_TO_OVERRIDE.hasOwnProperty(i)) {
        continue;
      }

      let method = ConsoleDriver.METHODS_TO_OVERRIDE[i];

      console[method] = nativeConsole[method];
    }

    return console;
  }

  /**
   * @param {String} msg
   * @param {String} level
   * @param {*} context
   */
  log(msg, level, context) {
    let nativeMethod = 'log';

    switch (level) {
      case Log.EMERGENCY:
      case Log.ERROR:
      case Log.CRITICAL:
        nativeMethod = 'error';
        break;
      case Log.ALERT:
      case Log.WARNING:
        nativeMethod = 'warn';
        break;
      case Log.NOTICE:
        nativeMethod = 'log';
        break;
      case Log.INFO:
        nativeMethod = 'info';
        break;
      case Log.DEBUG:
        nativeMethod = 'debug';
        break;
    }

    this._console[nativeMethod](AbstractDriver.timeString, msg);

    // @todo: figure out a better way of dumping context
    if (context) {
      this._console.debug(context);
    }
  }

  /**
   * @returns {ConsoleDriver}
   */
  overrideNative() {
    let nativeConsole = ConsoleDriver.nativeConsole;

    for (let i in ConsoleDriver.METHODS_TO_OVERRIDE) {
      if (!ConsoleDriver.METHODS_TO_OVERRIDE.hasOwnProperty(i)) {
        continue;
      }

      let method = ConsoleDriver.METHODS_TO_OVERRIDE[i];

      nativeConsole[method] = (...args) => {
        this._console[method](AbstractDriver.timeString, ...args);
      };
    }

    return this;
  }

  /**
   * @returns {Object}
   */
  static get nativeConsole() {
    return typeof window === 'undefined' ? console : window.console;
  }

  /**
   * @returns {String[]}
   */
  static get METHODS_TO_OVERRIDE() {
    return ['error', 'log', 'warn', 'info', 'debug'];
  }
}
