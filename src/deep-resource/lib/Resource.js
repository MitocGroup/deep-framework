/**
 * Created by AlexanderC on 6/10/15.
 */

'use strict';

import Kernel from 'deep-kernel';
import {Instance as ResourceInstance} from './Resource/Instance';
import {MissingResourceException} from './Exception/MissingResourceException';

/**
 * Bundle resource
 */
export class Resource extends Kernel.ContainerAware {
  /**
   * @param {Object} resources
   */
  constructor(resources = {}) {
    super();

    this._resources = resources;
    this._actionsConfig = {};

    this._baseUrl = null;
  }

  /**
   * @param {String} url
   * @returns {Resource}
   */
  baseUrl(url) {
    this._baseUrl = url;

    return this;
  }

  /**
   * @param {String} sourceId
   * @returns {Object|null}
   */
  getActionConfig(sourceId) {
    return this._actionsConfig.hasOwnProperty(sourceId) ?
      this._actionsConfig[sourceId] :
      null;
  }

  /**
   * @returns {Object}
   */
  get actionsConfig() {
    return this._actionsConfig;
  }

  /**
   * @param {String} identifier
   * @returns {Boolean}
   */
  has(identifier) {
    return this._resources[this.microservice.identifier].hasOwnProperty(identifier);
  }

  /**
   * @param {String} identifier (e.g @microservice_identifier:resource_name[:action_name])
   * @returns {ResourceInstance}
   */
  get(identifier) {
    let parsedIdentifier = this._parseResourceIdentifier(
      this._resolveIdentifier(identifier) // it also binds 'working' microservice to this instance
    );

    let resourceIdentifier = parsedIdentifier.resource;
    let actionIdentifier = parsedIdentifier.action;

    let microserviceIdentifier = this.microservice.identifier;

    if (!this.has(resourceIdentifier)) {
      throw new MissingResourceException(microserviceIdentifier, resourceIdentifier);
    }

    let resource = this._resources[microserviceIdentifier][resourceIdentifier];

    // inject dependencies (@todo - inject kernel instance instead)
    resource.cache = this.container.get('cache');
    resource.security = this.container.get('security');
    resource.validation = this.container.get('validation');
    resource.log = this.container.get('log');
    resource.contextProvider = this.kernel.contextProvider;
    resource.baseUrl = this._baseUrl;

    return actionIdentifier ? resource.action(actionIdentifier) : resource;
  }

  /**
   * @returns {Object}
   */
  get list() {
    let map = {};

    for (let microservice in this._resources) {
      if (!this._resources.hasOwnProperty(microservice)) {
        continue;
      }

      map[microservice] = Object.keys(this._resources[microservice]);
    }

    return map;
  }

  /**
   * @param {String} identifier
   * @returns {Object}
   * @private
   */
  _parseResourceIdentifier(identifier) {
    let parts = identifier.split(':').map((part) => {
      return part.trim();
    });

    return {
      resource: parts.shift(),
      action: parts.length > 0 ? parts.join(':') : null,
    };
  }

  /**
   * Booting a certain service
   *
   * @param {Kernel} kernel
   * @param {Function} callback
   */
  boot(kernel, callback) {
    let resourcesVector = [];

    for (let microserviceKey in kernel.microservices) {
      if (!kernel.microservices.hasOwnProperty(microserviceKey)) {
        continue;
      }

      let microservice = kernel.microservices[microserviceKey];

      this._resources[microservice.identifier] = {};

      for (let resourceName in microservice.rawResources) {
        if (!microservice.rawResources.hasOwnProperty(resourceName)) {
          continue;
        }

        let resource = new ResourceInstance(
          resourceName,
          microservice
        );

        resource.localBackend = this.localBackend;
        resource.isBackend = kernel.isBackend;

        this._resources[microservice.identifier][resourceName] = resource;

        resourcesVector.push(resource);

        let actionsConfig = resource.actionsConfig;

        for (let actionSourceId in actionsConfig) {
          if (!actionsConfig.hasOwnProperty(actionSourceId)) {
            continue;
          }

          this._actionsConfig[actionSourceId] = actionsConfig[actionSourceId];
        }
      }
    }

    callback();
  }
}
