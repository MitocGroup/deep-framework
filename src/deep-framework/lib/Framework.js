/**
 * Created by AlexanderC on 11/5/15.
 */

'use strict';

import Kernel from 'deep-kernel';
import DeepCore from 'deep-core';

export class Framework {
  /**
   * @param {Object} servicesMap
   * @param {String} context
   */
  constructor(servicesMap, context) {
    this._context = context;
    this._services = this._resolveServicesMap(servicesMap);
    this._version = require('../../package.json').version;
    this._kernelsMap = {};
  }

  /**
   * @returns {String}
   */
  get context() {
    return this._context;
  }

  /**
   * @returns {String}
   */
  get version() {
    return this._version;
  }

  /**
   * @todo: improve it
   *
   * @param {Object} context
   * @returns {Kernel}
   */
  KernelFromLambdaContext(context) {
    let kernelId = '';

    if (context.hasOwnProperty('identity')
      && context.identity.hasOwnProperty('cognitoIdentityPoolId')
      && context.identity.hasOwnProperty('cognitoIdentityId')) {

      kernelId = this._context.identity.cognitoIdentityPoolId;
    }

    return this.KernelCached(kernelId);
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

    this._kernelsMap[id] = this._createKernel();

    return this._kernelsMap[id];
  }

  /**
   * @todo: remove method in next release (back compatibility)
   *
   * @returns {Kernel}
   * @constructor
   */
  get Kernel() {
    return this.KernelCached('');
  }

  /**
   * @returns {Function}
   * @constructor
   */
  get Core() {
    return DeepCore;
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
   * @returns {Kernel}
   * @private
   */
  _createKernel() {
    return new Kernel(this._services, this._context);
  }
}
