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
    let sharedCacheDriver;
    let driver;

    if (kernel.isFrontend) {
      driver = Cache.createDriver('local-storage');
      sharedCacheDriver = Cache.createDriver('cloud-front', this);
    } else {
      // @todo: switch to redis when issue with Elasticache is fixed
      driver = Cache.createDriver('memory');
      sharedCacheDriver = Cache.createDriver('s3fs', this);
    }

    [driver, sharedCacheDriver].map(function(driver) {
      driver.buildId = kernel.buildId;
    });

    this._driver = driver;
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
