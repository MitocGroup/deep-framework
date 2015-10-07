/**
 * Created by mgoria on 5/28/15.
 */

'use strict';

import Kernel from 'deep-kernel';
import Path from 'path';

/**
 * @temp Asset class definition
 */
export class Asset extends Kernel.ContainerAware {
  constructor() {
    super();
  }

  /**
   * Booting a certain service
   *
   * @param {Kernel} kernel
   * @param {Function} callback
   */
  boot(kernel, callback) {
    if (kernel.isFrontend) {
      let loadVector = [];
      let microservices = kernel.microservices;

      for (let microserviceKey in microservices) {
        if (!microservices.hasOwnProperty(microserviceKey)) {
          continue;
        }

        let microservice = microservices[microserviceKey];

        if (microservice.isRoot) {
          continue;
        }

        loadVector.push(this.bind(microservice).locate('bootstrap.js'));
      }

      kernel.container.addParameter(
        Kernel.FRONTEND_BOOTSTRAP_VECTOR,
        loadVector
      );
    }

    callback();
  }

  /**
   * @param {String} object
   * @param {String} suffix
   * @returns {String}
   */
  locate(object, suffix = '') {
    // binds working microservice if specified in object parameter
    let path = this._resolvePath(object);

    if (this.microservice.isRoot) {
      return Path.join(path) + suffix;
    } else {
      return Path.join(this.microservice.toString(), path) + suffix;
    }
  }
}
