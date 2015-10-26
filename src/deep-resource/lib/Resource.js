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
    identifier = this._resolveIdentifier(identifier);

    let microserviceIdentifier = this.microservice.identifier;

    if (!this.has(identifier)) {
      throw new MissingResourceException(microserviceIdentifier, identifier);
    }

    return this._resources[microserviceIdentifier][identifier];
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
   * Booting a certain service
   *
   * @param {Kernel} kernel
   * @param {Function} callback
   */
  boot(kernel, callback) {
    let cache = kernel.container.get('cache');
    let security = kernel.container.get('security');

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
          microservice.rawResources[resourceName]
        );

        resource.cache = cache;
        resource.localBackend = this._localBackend;

        this._resources[microservice.identifier][resourceName] = resource;

        resourcesVector.push(resource);
      }
    }

    security.onTokenAvailable((token) => {
      let credentials = token.credentials;

      for (let resourceKey in resourcesVector) {
        if (!resourcesVector.hasOwnProperty(resourceKey)) {
          continue;
        }

        let resource = resourcesVector[resourceKey];

        resource.securityCredentials = credentials;
      }
    });

    callback();
  }
}
