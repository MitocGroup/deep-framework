/**
 * Created by AlexanderC on 11/5/15.
 */

'use strict';

import Kernel from 'deep-kernel';
import DeepCore from 'deep-core';
import {BackendContext} from './BackendContext';

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
   * @param {DeepFramework.Core.AWS.Lambda.Runtime|Handler|*} Handler
   * @returns {{handler: Function}}
   */
  LambdaHandler(Handler) {
    return {
      handler: (event, context, callback) => {
        let backendContext = new BackendContext(context);
        backendContext.fillWithEventData(event);

        this.KernelFromBackendContext(backendContext).bootstrap((deepKernel) => {
          new Handler(deepKernel).run(event, context, callback);
        });
      },
    };
  }

  /**
   *
   * @todo: improve it
   *
   * @param {BackendContext} backendContext
   * @returns {Kernel}
   *
   * @sample:
   * ```
   * exports.handler = function (event, context) {
   *   DeepFramework.KernelFromBackendContext(context).loadFromFile("_config.json", function (deepKernel) {
   *     new Handler(deepKernel).run(event, context);
   *   });
   * };
   * KernelFromBackendContext
   * ```
   */
  KernelFromBackendContext(backendContext) {
    let identityId = Framework.ANONYMOUS_IDENTITY_KEY;
    let lambdaContext = backendContext.runtimeContext;

    if (lambdaContext.hasOwnProperty('identity') &&
      lambdaContext.identity.hasOwnProperty('cognitoIdentityPoolId') &&
      lambdaContext.identity.hasOwnProperty('cognitoIdentityId')) {

      identityId = lambdaContext.identity.cognitoIdentityId;
    }

    let kernel = this._kernelCached(identityId);

    kernel.runtimeContext = lambdaContext; // @todo: remove "runtimeContext" on next major release
    kernel.backendContext = backendContext;

    return kernel;
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
