/**
 * Created by AlexanderC on 6/16/15.
 */

'use strict';

import Kernel from 'deep-kernel';
import Core from 'deep-core';
import {Exception} from './Exception/Exception';

/**
 * Cache manager
 */
export class Cache extends Kernel.ContainerAware {
  /**
   * @param {AbstractDriver} driver
   */
  constructor(driver = null) {
    super();

    this._driver = driver;
  }

  /**
   * @param {String} name
   * @param {Array} args
   * @returns {AbstractDriver}
   */
  static createDriver(name, ...args) {
    let DriverPrototype = null;

    switch (name) {
      case 'memory':
        DriverPrototype = require('./Driver/InMemoryDriver').InMemoryDriver;
        break;
      case 'redis':
        DriverPrototype = require('./Driver/RedisDriver').RedisDriver;
        break;
      case 'local-storage':
        DriverPrototype = require('./Driver/LocalStorageDriver').LocalStorageDriver;
        break;
      default:
        throw new Exception(`Missing driver ${name}`);
    }

    return new DriverPrototype(...args);
  }

  /**
   * Booting a certain service
   *
   * @param {Kernel} kernel
   * @param {Function} callback
   */
  boot(kernel, callback) {

    // @todo: switch to redis when issue with Elasticache is fixed
    let driverName = kernel.isFrontend ? 'local-storage' : 'memory'/*'redis'*/;

    this._driver = Cache.createDriver(driverName/*, kernel.config.cacheDsn*/);
    this._driver.buildId = kernel.buildId;

    callback();
  }

  /**
   * @param {AbstractDriver} target
   * @param {*} args
   * @returns {*}
   */
  apply(target, ...args) {
    return target(...args);
  }

  /**
   * DO NOT REMOVE THIS!
   * It's used while kernel boot
   *
   * @returns {Object}
   */
  get service() {
    return new Core.Generic.MethodsProxy(this)
      .proxyOverride(
      this._driver,
      'has', 'get', 'set',
      'invalidate', 'flush'
    );
  }

  /**
   * @param {AbstractDriver} driver
   */
  set driver(driver) {
    this._driver = driver;
  }

  /**
   * @returns {AbstractDriver}
   */
  get driver() {
    return this._driver;
  }
}
