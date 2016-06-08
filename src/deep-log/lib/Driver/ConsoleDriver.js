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

      // Fixes issue with node env
      if (method === 'debug' &&
        typeof nativeConsole[method] === 'undefined') {
        method = 'log';
      }

      console[method] = nativeConsole[method];

      console[method].bind(nativeConsole);
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

    // Fixes issue with node env
    let logMethod = this._console[nativeMethod] || this._console.log;
    logMethod.call(ConsoleDriver.nativeConsole, AbstractDriver.timeString, msg);

    // @todo: figure out a better way of dumping context
    if (context) {

      // Fixes issue with node env
      let debugMethod = this._console.debug || this._console.log;
      debugMethod.call(ConsoleDriver.nativeConsole, '[DEBUG]', context);
    }
  }

  /**
   * @param {Boolean} logTime
   * @param {Boolean} coloredOutput
   * @param {Boolean} turnOff
   * @returns {ConsoleDriver}
   */
  overrideNative(logTime = true, coloredOutput = true, turnOff = false) {
    let nativeConsole = ConsoleDriver.nativeConsole;

    for (let i in ConsoleDriver.METHODS_TO_OVERRIDE) {
      if (!ConsoleDriver.METHODS_TO_OVERRIDE.hasOwnProperty(i)) {
        continue;
      }

      let method = ConsoleDriver.METHODS_TO_OVERRIDE[i];

      if (!ConsoleDriver._isLogLevelEnabled(method)) {
        nativeConsole[method] = () => {};
        continue;
      }

      // Fixes issue with node env
      this._console[method] = this._console[method] || this._console.log;

      nativeConsole[method] = (...args) => {
        if (!turnOff) {
          let nativeArgs = args;

          if (coloredOutput) {
            nativeArgs = ConsoleDriver._colorOutput(method, nativeArgs);
          }

          if (logTime) {
            nativeArgs.unshift(AbstractDriver.timeString);
          }

          this._console[method](...nativeArgs);
        }
      };
    }

    return this;
  }

  /**
   * @param {String} method
   * @returns {Boolean}
   */
  static _isLogLevelEnabled(method) {
    return ConsoleDriver
      .ERROR_LEVELS_MAPPING[ConsoleDriver.ENV_LOG_LEVEL]
      .indexOf(method) !== -1;
  }

  /**
   * @returns {Object}
   */
  static get ERROR_LEVELS_MAPPING() {
    return {
      silent: ['log'],
      error: ['error', 'log',],
      warn: ['warn', 'log', 'error',],
      info: ['warn', 'log', 'error', 'info',],
      debug: ['debug', 'warn', 'log', 'info', 'error',],
    };
  }

  /**
   * @param {String} type
   * @param {Array} args
   * @returns {Array}
   * @private
   */
  static _colorOutput(type, args) {
    let color = null;

    switch(type.toLowerCase()) {
      case 'error':
        color = 31; // red
        break;
      case 'warn':
        color = 33; // yellow
        break;
      default: color = 32; // green
    }

    args.unshift(`\x1b[${color}m`);
    args.push('\x1b[0m');

    return args;
  }

  /**
   * @example `export DEEP_LOG_LEVEL=error|warn|debug|info|silent`
   * @returns {String}
   */
  static get ENV_LOG_LEVEL() {
    let envLevel = typeof window === 'undefined' ?
      process.env.DEEP_LOG_LEVEL :
      window.DEEP_LOG_LEVEL;

    envLevel = envLevel || 'info';
    envLevel = envLevel === 'undefined' ? 'info' : envLevel; // o_O

    return envLevel.toLowerCase();
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
