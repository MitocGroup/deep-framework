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

    this._injectBuildId = Asset.INJECT_BUILD_ID_STATE;
    this._buildId = null;
  }

  /**
   * @returns {Boolean}
   */
  get injectBuildId() {
    return this._injectBuildId;
  }

  /**
   * @param {Boolean} state
   */
  set injectBuildId(state) {
    this._injectBuildId = state;
  }

  /**
   * Booting a certain service
   *
   * @param {Kernel} kernel
   * @param {Function} callback
   */
  boot(kernel, callback) {
    this._buildId = kernel.buildId;

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
   * @param {Boolean} skipVersioning
   * @returns {*}
   */
  locate(assetIdentifier, suffix = '', skipVersioning = false) {
    let path = this._resolveIdentifier(assetIdentifier);

    let basePath = this.microservice.isRoot
      ? Path.join(path)
      : Path.join(this.microservice.toString(), path);

    let internalSuffix = (this._injectBuildId && this._buildId && !skipVersioning)
      ? `?_v=${this._buildId}`
      : '';

    return `${basePath}${suffix}${internalSuffix}`;
  }

  /**
   * @param {String} assetIdentifier (e.g. @microservice_identifier:asset_path)
   * @param {String} suffix
   * @returns {String}
   */
  locateAbsolute(...args) {
    return Asset._baseUrl + Path.join('/', this.locate(...args));
  }

  /**
   * @returns {String}
   */
  static get _baseUrl() {
    if (!window || !window.location) {
      return '';
    }

    let loc = window.location;

    return loc.origin ||
      `${loc.protocol}://${loc.hostname}${loc.port ? ':' + loc.port: ''}`;
  }

  /**
   * @returns {Boolean}
   */
  static get INJECT_BUILD_ID_STATE() {
    return true;
  }
}
