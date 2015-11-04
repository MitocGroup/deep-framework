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

        loadVector.push(this.locate(`@${microservice.identifier}:bootstrap.js`));
      }

      kernel.container.addParameter(
        Kernel.FRONTEND_BOOTSTRAP_VECTOR,
        loadVector
      );
    }

    callback();
  }

  /**
   * @param {String} assetIdentifier (e.g. @microservice_identifier:asset_path)
   * @param {String} suffix
   * @returns {String}
   */
  locate(assetIdentifier, suffix = '') {
    let path = this._resolveIdentifier(assetIdentifier);

    if (this.microservice.isRoot) {
      return Path.join(path) + suffix;
    } else {
      return Path.join(this.microservice.toString(), path) + suffix;
    }
  }
}
