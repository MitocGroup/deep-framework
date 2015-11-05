/**
 * Created by AlexanderC on 11/5/15.
 */

'use strict';

import Kernel from 'deep-kernel';
import DeepCore from 'deep-core';

export class Framework {
  /**
   * @param {Object} servicesMap
   */
  constructor(servicesMap) {
    this._services = this._resolveServicesMap(servicesMap);
    this._version = Framework._rawRersion;
    this._kernelsMap = {};
  }

  /**
   * @param {Object} servicesMap
   * @returns {Object}
   * @private
   */
  _resolveServicesMap(servicesMap) {
    let services = {};

    for (let serviceName in servicesMap) {
      if (!servicesMap.hasOwnProperty(serviceName)) {
        continue;
      }

      services[serviceName] = require(servicesMap[serviceName]);
    }

    return services;
  }

  /**
   * @returns {String}
   */
  get version() {
    return this._version;
  }

  /**
   * @param {String} id
   * @returns {Kernel}
   * @constructor
   */
  KernelCached(id) {
    if (this._kernelsMap.hasOwnProperty(id)) {
      return this._kernelsMap[id];
    }

    this._kernelsMap[id] = this.Kernel;

    return this._kernelsMap[id];
  }

  /**
   * @todo: remove method in next release (back compatibility)
   *
   * @returns {Kernel}
   * @constructor
   */
  get Kernel() {
    return Framework._createKernel(this._services);
  }

  /**
   * @returns {Function}
   * @constructor
   */
  get Core() {
    return DeepCore;
  }

  /**
   * @param {Object} services
   * @private
   */
  static _createKernel(services) {
    return new Kernel(services, Kernel.BACKEND_CONTEXT);
  }

  /**
   * @returns {String}
   * @private
   */
  static get _rawRersion() {
    return require('../../package.json').version;
  }
}
