/**
 * Created by mgoria on 5/26/2015
 */

'use strict';

import Bottle from 'bottlejs';
import {MissingServiceException} from './Exception/MissingServiceException';
import Core from 'deep-core';

/**
 * Deep dependency injection module
 */
export class DI {
  constructor() {
    this._bottle = new Bottle();
    this._localBackend = false;
  }

  /**
   * Registers a service to container
   *
   * @param {String} serviceName
   * @param {Object} serviceClass
   * @param {String[]} dependencies
   */
  register(serviceName, serviceClass, dependencies) {
    var args = [serviceName, serviceClass];

    if (dependencies) {
      args = args.concat(dependencies);
    }

    this._bottle.service.apply(this._bottle, args);
  }

  /**
   * Defines a factory method to create a service
   *
   * @param {String} serviceName
   * @param {Object} factoryClass
   */
  factory(serviceName, factoryClass) {
    this._bottle.factory(serviceName, factoryClass);
  }

  /**
   * Adds a parameter into container
   *
   * @param {String} name
   * @param {*} value
   */
  addParameter(name, value) {
    this._bottle.value(name, value);
  }

  /**
   * Adds an instantiated service into container
   *
   * @param {String} name
   * @param {Object} value
   */
  addService(name, value) {
    if (!(value instanceof Object)) {
      throw new Core.Exception.InvalidArgumentException(value, 'Object');
    }

    this._bottle.value(name, value);
  }

  /**
   * Returns a service / parameter from container
   * @param {String} key
   * @returns {Object}
   */
  get(key) {
    if (typeof this._bottle.container[key] === 'undefined') {
      throw new MissingServiceException(`Unregistered service or parameter "${key}"`);
    }

    return this._bottle.container[key];
  }

  /**
   * Checks if service / parameter exists in container
   * @param {String} key
   * @returns {Boolean}
   */
  has(key) {
    return this._bottle.container.hasOwnProperty(key);
  }

  /**
   * @param {Boolean} localBackend
   */
  set localBackend(localBackend) {
    this._localBackend = localBackend;
  }

  /**
   * @returns {Boolean}
   */
  get localBackend() {
    return this._localBackend;
  }
}
