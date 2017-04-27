/**
 * Created by AlexanderC on 11/5/15.
 */

'use strict';

const DEEP_X_RAY_ENABLED = process.env.DEEP_X_RAY_ENABLED == 'true';

var AWSXRay = require('aws-xray-sdk-core');
var AWS = require('aws-sdk');
var https = require('https');

if (DEEP_X_RAY_ENABLED) {
  AWSXRay.captureAWS(AWS);
  AWSXRay.captureHTTPs(https);
}

import Kernel from 'deep-kernel';
import DeepCore from 'deep-core';
import {ContextProvider} from './ContextProvider';

export class Framework {
  /**
   * @param {Object} servicesMap
   * @param {String} context
   */
  constructor(servicesMap, context) {
    this._context = context;
    this._services = servicesMap;
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
    let handler = {
      handler: (event, context, callback) => {
        this.KernelFromLambdaContext(context, event).bootstrap((deepKernel) => {
          new Handler(deepKernel).run(event, context, callback);
        });
      },
    };

    if (DEEP_X_RAY_ENABLED) {
      handler = {
        handler: (event, context, callback) => {
          let contextSegment = AWSXRay.getSegment();

          let overheadSubSegment = contextSegment.addNewSubsegment('DeepCustom_FrameworkOverhead');
          let bootstrapSubSegment = contextSegment.addNewSubsegment('DeepCustom_KernelBootstrap');

          this.KernelFromLambdaContext(context, event).bootstrap((deepKernel) => {
            bootstrapSubSegment.close();

            // injecting it into context to be closed into /deep-core/lib/AWS/Lambda/Runtime.js
            context.overheadSubSegment = overheadSubSegment;

            new Handler(deepKernel).run(event, context, callback);
          });
        },
      };
    }

    return handler;
  }

  /**
   *
   * @todo: improve it
   *
   * @param {Object} lambdaContext
   * @param {Object} lambdaEvent
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
  KernelFromLambdaContext(lambdaContext, lambdaEvent) {
    let contextProvider = new ContextProvider(lambdaContext)
      .fillContextWithEventData(lambdaEvent);

    let identityId = Framework.ANONYMOUS_IDENTITY_KEY;

    if (lambdaContext.hasOwnProperty('identity') &&
      lambdaContext.identity.cognitoIdentityPoolId &&
      lambdaContext.identity.cognitoIdentityId) {

      identityId = lambdaContext.identity.cognitoIdentityId;
    }

    let kernel = this._kernelCached(identityId);

    kernel.runtimeContext = lambdaContext; // @todo: remove "runtimeContext" on next major release
    kernel.contextProvider = contextProvider;  

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
