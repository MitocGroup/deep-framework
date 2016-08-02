/**
 * Created by AlexanderC on 6/15/15.
 */

'use strict';

import Kernel from 'deep-kernel';
import Core from 'deep-core';
import {ConsoleDriver} from './Driver/ConsoleDriver';
import {RavenDriver} from './Driver/RavenDriver';
import {RavenBrowserDriver} from './Driver/RavenBrowserDriver';
import {RumSqsDriver} from './Driver/RumSqsDriver';
import {AbstractDriver} from './Driver/AbstractDriver';

/**
 * Logging manager
 */
export class Log extends Kernel.ContainerAware {
  /**
   * @param {Object} drivers
   */
  constructor(drivers = {}) {
    super();

    this._drivers = new Core.Generic.ObjectStorage();

    for (let driverName in drivers) {
      if (!drivers.hasOwnProperty(driverName)) {
        continue;
      }

      this.register(driverName, drivers[driverName]);
    }
  }

  /**
   * Booting a certain service
   *
   * @param {Kernel} kernel
   * @param {Function} callback
   */
  boot(kernel, callback) {
    let globals = kernel.config.globals;
    let drivers = globals.logDrivers || {};

    // add console driver by default to all environments except for PROD
    if (!drivers.hasOwnProperty('console') && kernel.env !== Kernel.PROD_ENVIRONMENT) {
      drivers.console = {};
    }

    for (let driverName in drivers) {
      if (!drivers.hasOwnProperty(driverName)) {
        continue;
      }

      this.register(driverName, drivers[driverName]);
    }

    callback();
  }

  /**
   *
   * @param {String} type
   * @param {Array} args
   * @returns {AbstractDriver}
   */
  create(type, ...args) {
    var driver;

    switch (type.toLowerCase()) {
      case 'console':
        driver = new ConsoleDriver(...args);
        break;
      case 'raven':
      case 'sentry':
        let DriverPrototype = this.container.get(Kernel.CONTEXT).isFrontend ? RavenBrowserDriver : RavenDriver;

        driver = new DriverPrototype(
          args.length > 0 && typeof args[0] === 'object'
            ? args[0].dsn
            : null
        );
        break;
      case 'rum':
        let rumQueueUrl = this.kernel.config.hasOwnProperty('rumQueue') ? this.kernel.config.rumQueue.url : '';
        let enabled = (args.length > 0 && args[0] && typeof args[0] === 'object') ? args[0].enabled : false;

        driver = new RumSqsDriver(rumQueueUrl, this.kernel, enabled);
        break;
      default:
        throw new Core.Exception.InvalidArgumentException(
          type,
          '[Console, Raven, Sentry, RUM]'
        );
    }

    return driver;
  }

  /**
   * @param {*} args
   * @returns {Log}
   *
   * @todo: do we need this here?
   */
  overrideJsConsole(...args) {
    let consoleDriver = this._drivers.find(ConsoleDriver);

    if (!consoleDriver) {
      this.register('console');
    }

    (consoleDriver || this._drivers.find(ConsoleDriver))
      .overrideNative(...args);

    return this;
  }

  /**
   * @param {AbstractDriver|String} driver
   * @param {Array} args
   * @returns {Log}
   */
  register(driver, ...args) {
    if (typeof driver === 'string') {
      driver = this.create(driver, ...args);
    }

    if (!(driver instanceof AbstractDriver)) {
      throw new Core.Exception.InvalidArgumentException(driver, 'AbstractDriver');
    }

    this._drivers.add(driver);

    return this;
  }

  /**
   * @returns {Core.Generic.ObjectStorage}
   */
  get drivers() {
    return this._drivers;
  }

  /**
   * @param {String} msg
   * @param {String} level
   * @param {Object} context
   * @returns {Log}
   */
  log(msg, level = Log.INFO, context = {}) {
    let driversArr = this.drivers.iterator;

    for (let driverKey in driversArr) {
      if (!driversArr.hasOwnProperty(driverKey)) {
        continue;
      }

      let driver = driversArr[driverKey];

      // do not log common messages into RUM
      if (driver instanceof RumSqsDriver) {
        continue;
      }

      driver.log(msg, level, context);
    }

    return this;
  }

  /**
   * @returns {Boolean}
   */
  isRumEnabled() {
    let driver = this.rumDriver();

    return driver && driver.enabled;
  }

  /**
   * @param {Object} event
   */
  rumLog(event) {
    let driver = this.rumDriver();

    if (driver) {
      driver.log(event, (error, data) => {
        if (error) {
          this.log(error, Log.ERROR, event);
        }
      });
    }
  }

  /**
   * Flushes RUM batch messages
   * @param {Function} callback
   */
  rumFlush(callback) {
    let driver = this.rumDriver();

    if (!driver) {
      callback(null, null);
      return;
    }

    driver.flush((error, data) => {
      if (error) {
        this.log(error, Log.ERROR);
      }

      callback(error, data);
    });
  }

  /**
   * @returns {RumSqsDriver}
   */
  rumDriver() {
    return this.drivers.find(RumSqsDriver);
  }

  /**
   * @param {String} msg
   * @param {Object} context
   * @returns {Log}
   */
  debug(msg, context = {}) {
    return this.log(msg, Log.DEBUG, context);
  }

  /**
   * @param {String} msg
   * @param {Object} context
   * @returns {Log}
   */
  err(msg, context = {}) {
    return this.log(msg, Log.ERROR, context);
  }

  /**
   * @param {Array} args
   * @returns {Object}
   */
  error(...args) {
    return this.err(...args);
  }

  /**
   * @param {String} msg
   * @param {Object} context
   * @returns {Log}
   */
  info(msg, context = {}) {
    return this.log(msg, Log.INFO, context);
  }

  /**
   * @param {String} msg
   * @param {Object} context
   * @returns {Log}
   */
  warn(msg, context = {}) {
    return this.log(msg, Log.WARNING, context);
  }

  /**
   * @param {*} args
   * @returns {*}
   */
  warning(...args) {
    return this.warn(...args);
  }

  /**
   * @param {String} msg
   * @param {Object} context
   * @returns {Log}
   */
  emerg(msg, context = {}) {
    return this.log(msg, Log.EMERGENCY, context);
  }

  /**
   * @param {*} args
   * @returns {*}
   */
  emergency(...args) {
    return this.emerg(...args);
  }

  /**
   * @param {String} msg
   * @param {Object} context
   * @returns {Log}
   */
  crit(msg, context = {}) {
    return this.log(msg, Log.CRITICAL, context);
  }

  /**
   * @param {*} args
   * @returns {*}
   */
  critical(...args) {
    return this.crit(...args);
  }

  /**
   * @param {String} msg
   * @param {Object} context
   * @returns {Log}
   */
  notice(msg, context = {}) {
    return this.log(msg, Log.NOTICE, context);
  }

  /**
   * @param {String} msg
   * @param {Object} context
   * @returns {Log}
   */
  alert(msg, context = {}) {
    return this.log(msg, Log.ALERT, context);
  }

  /**
   * @returns {Array}
   */
  static get LEVELS() {
    return [
      Log.EMERGENCY,
      Log.ALERT,
      Log.CRITICAL,
      Log.ERROR,
      Log.WARNING,
      Log.NOTICE,
      Log.INFO,
      Log.DEBUG,
    ];
  }

  /**
   * @returns {String}
   */
  static get EMERGENCY() {
    return 'emergency';
  }

  /**
   * @returns {String}
   */
  static get ALERT() {
    return 'alert';
  }

  /**
   * @returns {String}
   */
  static get CRITICAL() {
    return 'critical';
  }

  /**
   * @returns {String}
   */
  static get ERROR() {
    return 'error';
  }

  /**
   * @returns {String}
   */
  static get WARNING() {
    return 'warning';
  }

  /**
   * @returns {String}
   */
  static get NOTICE() {
    return 'notice';
  }

  /**
   * @returns {String}
   */
  static get INFO() {
    return 'info';
  }

  /**
   * @returns {String}
   */
  static get DEBUG() {
    return 'debug';
  }
}
