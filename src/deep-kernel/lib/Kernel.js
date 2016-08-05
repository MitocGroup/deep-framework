/**
 * Created by mgoria on 5/26/15.
 */

/*eslint no-proto: 0*/

'use strict';

import Core from 'deep-core';
import DI from 'deep-di';
import {Exception} from './Exception/Exception';
import {Instance as Microservice} from './Microservice/Instance';
import {MissingMicroserviceException} from './Exception/MissingMicroserviceException';
import {Injectable as MicroserviceInjectable} from './Microservice/Injectable';
import {ContainerAware} from './ContainerAware';
import WaitUntil from 'wait-until';
import util from 'util';
import {Loader as ConfigLoader} from './Config/Loader';
import {AsyncConfig} from './Config/Driver/AsyncConfig';

/**
 * Deep application kernel
 */
export class Kernel {
  /**
   * @param {Array} deepServices
   * @param {String} context
   */
  constructor(deepServices, context) {
    if (Kernel.ALL_CONTEXTS.indexOf(context) === -1) {
      throw new Exception(`Undefined context "${context}"`);
    }

    this._config = {};
    this._services = deepServices;
    this._context = context;
    this._runtimeContext = {};
    this._contextProvider = null;
    this._env = null;
    this._container = new DI();
    this._isLoaded = false;

    this._asyncConfigCache = null;
  }

  /**
   * @returns {Boolean}
   */
  get isLoaded() {
    return this._isLoaded;
  }

  /**
   * @returns {Object}
   */
  get runtimeContext() {
    return this._runtimeContext;
  }

  /**
   * @param {Object} runtimeContext
   */
  set runtimeContext(runtimeContext) {
    this._runtimeContext = runtimeContext;
  }

  /**
   * @returns {Object}
   */
  get contextProvider() {
    return this._contextProvider;
  }

  /**
   * @param {Object} contextProvider
   */
  set contextProvider(contextProvider) {
    this._contextProvider = contextProvider;
  }

  /**
   * @returns {Microservice|*}
   */
  get rootMicroservice() {
    for (let microserviceKey in this.microservices) {
      if (!this.microservices.hasOwnProperty(microserviceKey)) {
        continue;
      }

      let microservice = this.microservices[microserviceKey];

      if (microservice.isRoot) {
        return microservice;
      }
    }

    // this should never happen...
    throw new MissingMicroserviceException('ROOT');
  }

  /**
   * @param {String|null} identifier
   * @returns {Microservice|*}
   */
  microservice(identifier = null) {
    if (!identifier) {
      identifier = this._config.microserviceIdentifier;
    }

    for (let microserviceKey in this.microservices) {
      if (!this.microservices.hasOwnProperty(microserviceKey)) {
        continue;
      }

      let microservice = this.microservices[microserviceKey];

      if (microservice.identifier === identifier) {
        return microservice;
      }
    }

    throw new MissingMicroserviceException(identifier);
  }

  /**
   *
   * @param {Function} cb
   * @returns {Kernel}
   */
  loadAsyncConfig(cb) {
    if (this._asyncConfigCache) {
      cb(this._asyncConfigCache);

      return this;
    }

    let cache = this.get('cache').system;
    let cacheKey = Kernel.ASYNC_CONFIG_CACHE_KEY;

    cache.has(cacheKey, (error, exists) => {
      this._logErrorIfExistsAndNotProd(error);

      if (exists) {
        cache.get(cacheKey, (error, rawConfig) => {
          this._logErrorIfExistsAndNotProd(error);

          if (rawConfig) {
            try {
              this._asyncConfigCache = JSON.parse(rawConfig);

              cb(this._asyncConfigCache);

              return;
            } catch (error) {
              this._logErrorIfExistsAndNotProd(error);
            }
          }

          this._loadAsyncConfig(cache, cacheKey, cb);
        });

        return;
      }

      this._loadAsyncConfig(cache, cacheKey, cb);
    });

    return this;
  }

  /**
   * @param {Cache|*} cache
   * @param {String} cacheKey
   * @param {Function} cb
   * @private
   */
  _loadAsyncConfig(cache, cacheKey, cb) {
    ConfigLoader
      .asyncConfigLoader(this)
      .load((config) => {
        cache.set(cacheKey, JSON.stringify(config), 0, (error) => {
          this._logErrorIfExistsAndNotProd(error);

          this._asyncConfigCache = config;

          cb(config);
        });
      }, (error) => {
        this._logErrorIfExistsAndNotProd(error);

        cb(null);
      });
  }

  /**
   * @todo: get rid of this?
   *
   * @param {Error|String|*} error
   * @private
   */
  _logErrorIfExistsAndNotProd(error) {
    if (error && this.env !== Kernel.PROD_ENVIRONMENT) {
      console.error(error);
    }
  }

  /**
   * @param {Function} callback
   * @returns {Kernel}
   *
   * @todo: put config file name into a constant?
   */
  bootstrap(callback) {
    let rumEvent = {
      service: 'deep-kernel',
      resourceType: 'Lambda',
      eventName: 'KernelLoad',
      time: new Date().getTime(),
    };

    // @todo: remove AWS changes the way the things run
    // This is used because of AWS Lambda
    // context sharing after a cold start
    if (this._isLoaded) {
      if (this.isBackend) {
        rumEvent.eventName = 'KernelLoadFromCache';
        rumEvent.resourceId = this.runtimeContext.invokedFunctionArn;
        rumEvent.payload = this.config;

        this.get('log').rumLog(rumEvent);
      }

      callback(this);

      return this;
    }

    ConfigLoader
      .kernelLoader(this)
      .load((config) => {
        this.load(config, (kernel) => {
          if (this.isBackend) {
            // Log event 'start' time
            rumEvent.resourceId = this.runtimeContext.invokedFunctionArn;

            this.get('log').rumLog(rumEvent);

            // log event 'stop' time
            let event = util._extend({}, rumEvent);
            event.payload = kernel.config;
            event.time = new Date().getTime();

            this.get('log').rumLog(event);
          }

          callback(kernel);
        });
      }, (error) => {
        throw new Exception(`Error loading kernel: ${error}`);
      });

    return this;
  }

  /**
   * Loads all Kernel dependencies
   *
   * @param {Object} config
   * @param {Function} callback
   *
   * @returns {Kernel}
   */
  load(config, callback) {

    // @todo: remove AWS changes the way the things run
    // This is used because of AWS Lambda
    // context sharing after a cold start
    if (this._isLoaded) {
      callback(this);
      return this;
    }

    let originalCallback = callback;

    callback = (kernel) => {
      this._isLoaded = true;

      originalCallback(kernel);
    };

    this._config = config;

    this._buildContainer(callback);

    return this;
  }

  /**
   * @param {*} args
   * @returns {*}
   */
  get(...args) {
    return this._container.get(...args);
  }

  /**
   * @param {Array} args
   * @returns {Boolean}
   */
  has(...args) {
    return this._container.has(...args);
  }

  /**
   * @returns {Array}
   */
  get services() {
    return this._services;
  }

  /**
   * @returns {DI}
   */
  get container() {
    return this._container;
  }

  /**
   * @returns {Boolean}
   */
  get isRumEnabled() {
    return this.has('log') && this.get('log').isRumEnabled();
  }

  /**
   * @returns {Boolean}
   */
  get isFrontend() {
    return this._context === Kernel.FRONTEND_CONTEXT;
  }

  /**
   * @returns {Boolean}
   */
  get isLocalhost() {
    return this.isFrontend && [
      'localhost', '127.0.0.1',
      '0.0.0.0', '::1',
    ].indexOf(window.location.hostname) !== -1;
  }

  /**
   * @returns {Boolean}
   */
  get isBackend() {
    return this._context === Kernel.BACKEND_CONTEXT;
  }

  /**
   * @returns {String}
   */
  get buildId() {
    return this._config.deployId || '';
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
  get env() {
    return this._env;
  }

  /**
   * @returns {Object}
   */
  get config() {

    // @todo - create a class DeepConfig or smth, that will hold global config and expose shortcuts to different options
    return this._config;
  }

  /**
   * @returns {Microservice[]}
   */
  get microservices() {
    return this._container.get(Kernel.MICROSERVICES);
  }

  /**
   * Loads all parameters and services into DI container
   *
   * @param {Function} callback
   */
  _buildContainer(callback) {
    this._env = this._config.env;

    this._container.addParameter(
      Kernel.KERNEL,
      this
    );

    this._container.addParameter(
      Kernel.CONTEXT,
      {
        environment: this._env,
        isFrontend: this.isFrontend,
        isBackend: this.isBackend,
      }
    );

    this._container.addParameter(
      Kernel.MICROSERVICES,
      Microservice.createVector(this._config)
    );

    this._container.addParameter(
      Kernel.CONFIG,
      this._config
    );

    this._container.localBackend = Core.IS_DEV_SERVER;

    let bootingServices = 0;

    for (let serviceKey in this._services) {
      if (!this._services.hasOwnProperty(serviceKey)) {
        continue;
      }

      let serviceInstance = new this._services[serviceKey]();

      bootingServices++;

      serviceInstance.kernel = this;
      serviceInstance.localBackend = Core.IS_DEV_SERVER;
      serviceInstance.boot(this, () => {
        bootingServices--;
      });

      this._container.addService(
        serviceInstance.name,
        Kernel._createProxyIfNeeded(serviceInstance)
      );
    }

    WaitUntil()
      .interval(10)
      .times(999999) // @todo: get rid of magic here...
      .condition((cb) => {
        process.nextTick(() => {
          cb(bootingServices <= 0);
        });
      }).done(() => {
        callback(this);
      });
  }

  /**
   * @param {ContainerAware|Object} serviceObj
   * @returns {ContainerAware|Proxy|Object}
   * @private
   */
  static _createProxyIfNeeded(serviceObj) {
    if (serviceObj === serviceObj.service) {
      return serviceObj;
    } else if(!serviceObj.hasOwnProperty('apply')) {
      return serviceObj.service;
    }

    let proxy = new Proxy(serviceObj, serviceObj.service);

    proxy.__proto__ = this.__proto__;
    proxy.constructor.prototype = this.constructor.prototype;

    return proxy;
  }

  /**
   * @returns {MicroserviceInjectable}
   */
  static get MicroserviceInjectable() {
    return MicroserviceInjectable;
  }

  /**
   * @returns {ContainerAware}
   */
  static get ContainerAware() {
    return ContainerAware;
  }

  /**
   * @returns {String}
   */
  static get FRONTEND_BOOTSTRAP_VECTOR() {
    return 'deep_frontend_bootstrap_vector';
  }

  /**
   * @returns {String}
   */
  static get CONFIG() {
    return 'deep_config';
  }

  /**
   * @returns {String}
   */
  static get KERNEL() {
    return 'deep_kernel';
  }

  /**
   * @returns {String}
   */
  static get CONTEXT() {
    return 'deep_context';
  }

  /**
   * @returns {String}
   */
  static get MICROSERVICES() {
    return 'deep_microservices';
  }

  /**
   * @returns {String}
   */
  static get FRONTEND_CONTEXT() {
    return 'frontend-ctx';
  }

  /**
   * @returns {String}
   */
  static get BACKEND_CONTEXT() {
    return 'backend-ctx';
  }

  /**
   * @returns {Array}
   */
  static get ALL_CONTEXTS() {
    return [
      Kernel.FRONTEND_CONTEXT,
      Kernel.BACKEND_CONTEXT,
    ];
  }

  /**
   * @returns {String}
   */
  static get PROD_ENVIRONMENT() {
    return 'prod';
  }

  /**
   * @returns {String}
   */
  static get STAGE_ENVIRONMENT() {
    return 'stage';
  }

  /**
   * @returns {String}
   */
  static get TEST_ENVIRONMENT() {
    return 'test';
  }

  /**
   * @returns {String}
   */
  static get DEV_ENVIRONMENT() {
    return 'dev';
  }

  /**
   * @returns {String}
   */
  static get ASYNC_CONFIG_FILE(){
    return AsyncConfig.DEFAULT_CONFIG_FILE;
  }

  /**
   * @returns {String}
   */
  static get ASYNC_CONFIG_CACHE_KEY() {
    return 'asyncConfig';
  }

  /**
   * @returns {Array}
   */
  static get ALL_ENVIRONMENTS() {
    return [
      Kernel.PROD_ENVIRONMENT,
      Kernel.STAGE_ENVIRONMENT,
      Kernel.TEST_ENVIRONMENT,
      Kernel.DEV_ENVIRONMENT,
    ];
  }
}
