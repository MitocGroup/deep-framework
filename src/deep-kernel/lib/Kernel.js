/**
 * Created by mgoria on 5/26/15.
 */

'use strict';

import Core from 'deep-core';
import DI from 'deep-di';
import {Exception} from './Exception/Exception';
import {Instance as Microservice} from './Microservice/Instance';
import {MissingMicroserviceException} from './Exception/MissingMicroserviceException';
import {Injectable as MicroserviceInjectable} from './Microservice/Injectable';
import {ContainerAware} from './ContainerAware';
import FileSystem from 'fs';
import WaitUntil from 'wait-until';

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
    this._env = null;
    this._container = new DI();
    this._isLoaded = false;
  }

  /**
   * @returns {Boolean}
   */
  get isLoaded() {
    return this._isLoaded;
  }

  /**
   * @param {String} identifier
   * @returns {Microservice}
   */
  microservice(identifier) {
    if (typeof identifier === 'undefined') {
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
   * @param {String} jsonFile
   * @param {Function} callback
   * @returns {Kernel}
   */
  loadFromFile(jsonFile, callback) {
    // @todo: remove AWS changes the way the things run
    // This is used because of AWS Lambda
    // context sharing after a cold start
    if (this._isLoaded) {
      callback(this);
      return this;
    }

    if (this.isBackend) {
      FileSystem.readFile(jsonFile, 'utf8', function(error, data) {
        if (error) {
          throw new Exception(`Failed to load kernel config from ${jsonFile} (${error})`);
        }

        this.load(JSON.parse(data), callback);
      }.bind(this));
    } else { // @todo: get rid of native code...
      var client = new XMLHttpRequest();

      client.open('GET', jsonFile);
      client.onreadystatechange = function(event) {
        if (client.readyState === 4) {
          if (client.status !== 200) {
            throw new Exception(`Failed to load kernel config from ${jsonFile}`);
          }

          this.load(JSON.parse(client.responseText), callback);
        }
      }.bind(this);

      client.send();
    }

    return this;
  }

  /**
   * Loads all Kernel dependencies
   *
   * @param {Object} globalConfig
   * @param {Function} callback
   */
  load(globalConfig, callback) {
    // @todo: remove AWS changes the way the things run
    // This is used because of AWS Lambda
    // context sharing after a cold start
    if (this._isLoaded) {
      callback(this);
      return this;
    }

    let originalCallback = callback;

    callback = function(kernel) {
      this._isLoaded = true;

      originalCallback(kernel);
    }.bind(this);

    this._config = globalConfig;

    this._buildContainer(callback);

    return this;
  }

  /**
   * @param {Array} args
   * @returns {*}
   */
  get(...args) {
    return this._container.get(...args);
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
  get isFrontend() {
    return this._context === Kernel.FRONTEND_CONTEXT;
  }

  /**
   * @returns {Boolean}
   */
  get isLocalhost() {
    return this.isFrontend
      && [
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

    let bootingServices = 0;

    for (let serviceKey in this._services) {
      if (!this._services.hasOwnProperty(serviceKey)) {
        continue;
      }

      let serviceInstance = new this._services[serviceKey]();

      if (!serviceInstance instanceof ContainerAware) {
        let serviceType = typeof serviceInstance;

        throw new Exception(`Service ${serviceType} must be Kernel.ContainerAware instance`);
      }

      bootingServices++;

      serviceInstance.container = this._container;
      serviceInstance.localBackend = Core.IS_DEV_SERVER;
      serviceInstance.boot(this, function() {
        bootingServices--;
      }.bind(this));

      this._container.addService(
        serviceInstance.name,
        serviceInstance.service
      );
    }

    WaitUntil()
      .interval(5)
      .times(999999) // @todo: get rid of magic here...
      .condition(function(cb) {
        process.nextTick(function() {
          cb(bootingServices <= 0);
        }.bind(this));
      }).done(function() {
        callback(this);
      }.bind(this));
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
}
