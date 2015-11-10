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
    this._version = require('../package.json').version;
    this._kernelsMap = {};
  }

  /**
   * @returns {string}
   */
  static get ANONYMOUS_IDENTITY_KEY() {
    return 'anonymous';
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
   *
   * @todo: improve it
   *
   * @param {Object} lambdaContext
   * @returns {Kernel}
   *
   * @sample:
   * ```
   * exports.handler = function (event, context) {
   *   DeepFramework.KernelFromLambdaContext(context).loadFromFile("_config.json", function (deepKernel) {
   *     new Handler(deepKernel).run(event, context);
   *   });
   * };
   * KernelFromLambdaContext
   * ```
   */
  KernelFromLambdaContext(lambdaContext) {
    let identityId = Framework.ANONYMOUS_IDENTITY_KEY;

    if (lambdaContext.hasOwnProperty('identity') &&
      lambdaContext.identity.hasOwnProperty('cognitoIdentityPoolId') &&
      lambdaContext.identity.hasOwnProperty('cognitoIdentityId')) {

      identityId = lambdaContext.identity.cognitoIdentityId;
    }

    return this._kernelCached(identityId);
  }

  /**
   * @param {String} id
   * @returns {Kernel}
   * @constructor
   */
  _kernelCached(id) {
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
    return this._kernelCached(Framework.ANONYMOUS_IDENTITY_KEY);
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

      let serviceObj = servicesMap[serviceName];

      if (typeof serviceObj === 'string') {
        serviceObj = require(servicesMap[serviceName]);
      }

      services[serviceName] = serviceObj;
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

  /**
   * @returns {String}
   */
  static get BACKEND_CONTEXT() {
    return Kernel.BACKEND_CONTEXT;
  }

  /**
   * @returns {String}
   */
  static get FRONTEND_CONTEXT() {
    return Kernel.FRONTEND_CONTEXT;
  }
}
