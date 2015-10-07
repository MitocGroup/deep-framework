/**
 * Created by AlexanderC on 6/16/15.
 */

'use strict';

import Kernel from 'deep-kernel';
import {InMemoryDriver} from './Driver/InMemoryDriver';
import {RedisDriver} from './Driver/RedisDriver';
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
    var DriverPrototype;

    switch (name) {
      case 'memory':
        DriverPrototype = InMemoryDriver;
        break;
      case 'redis':
        DriverPrototype = RedisDriver;
        break;
      case 'local-storage':

        // @todo: figure out a smarter way to avoid conflicts in nodejs env
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

    kernel.container.addService(
      `${this.name}.prototype`,
      this
    );

    callback();
  }

  /**
   * DO NOT REMOVE THIS!
   * It's used while kernel boot
   *
   * @returns {Object}
   */
  get service() {
    return this._driver;
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
