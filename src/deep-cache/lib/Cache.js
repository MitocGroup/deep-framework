/**
 * Created by AlexanderC on 6/16/15.
 */

'use strict';

import Kernel from 'deep-kernel';
import Core from 'deep-core';
import {Exception} from './Exception/Exception';
import {SharedCache} from './SharedCache';

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
   * @param {*} args
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

        // fallback to in-memory driver if localStorage is not available
        if (!DriverPrototype.isAvailable()) {
          DriverPrototype = require('./Driver/InMemoryDriver').InMemoryDriver;
        }
        break;
      case 's3fs':
        DriverPrototype = require('./Driver/S3FSDriver').S3FSDriver;
        break;
      case 'cloud-front':
        DriverPrototype = require('./Driver/CloudFrontDriver').CloudFrontDriver;
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

    // @todo: remove in memory fallback for backend?
    this._driver = kernel.isFrontend ?
      Cache.createDriver('local-storage') :
      (kernel.config.cacheDsn ?
        Cache.createDriver('redis', kernel.config.cacheDsn) :
        Cache.createDriver('memory'));

    let sharedCacheDriver = kernel.isFrontend ?
      Cache.createDriver('cloud-front', this) :
      Cache.createDriver('s3fs', this);

    [this._driver, sharedCacheDriver].map((driver) => {
      driver.buildId = kernel.buildId;
    });

    this._shared = new SharedCache(sharedCacheDriver);

    callback();
  }

  /**
   * @returns {SharedCache}
   */
  get shared() {
    return this._shared;
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
      'invalidate', 'flush', 'type'
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
