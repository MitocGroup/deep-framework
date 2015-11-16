/**
 * Created by AlexanderC on 6/15/15.
 */

'use strict';

import Kernel from 'deep-kernel';
import Core from 'deep-core';
import {ConsoleDriver} from './Driver/ConsoleDriver';
import {RavenDriver} from './Driver/RavenDriver';
import {RavenBrowserDriver} from './Driver/RavenBrowserDriver';
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
    // @todo: remove this compatibility hook
    let globals = kernel.config.globals || kernel.config;

    let drivers = globals.logDrivers;

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
      default:
        throw new Core.Exception.InvalidArgumentException(
          type,
          '[Console, Raven, Sentry]'
        );
    }

    return driver;
  }

  /**
   * @returns {Log}
   *
   * @todo: do we need this here?
   */
  overrideJsConsole() {
    if (!this._drivers.find(ConsoleDriver)) {
      this.register('console');
    }

    this._drivers.find(ConsoleDriver).overrideNative();

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
   * @param {*} context
   * @returns Log
   */
  log(msg, level = Log.INFO, context = {}) {
    let driversArr = this.drivers.iterator;

    for (let driverKey in driversArr) {
      if (!driversArr.hasOwnProperty(driverKey)) {
        continue;
      }

      let driver = driversArr[driverKey];

      driver.log(msg, level, context);
    }

    return this;
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
   * @param {*} args
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
