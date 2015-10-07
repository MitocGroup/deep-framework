/**
 * Created by AlexanderC on 6/10/15.
 */

'use strict';

import {Injectable as MicroserviceInjectable} from './Microservice/Injectable';
import {Kernel} from './Kernel';

/**
 * Container aware instance
 */
export class ContainerAware extends MicroserviceInjectable {
  constructor() {
    super();

    this._container = null;
    this._localBackend = false;
  }

  /**
   * @returns {Boolean}
   */
  get localBackend() {
    return this._localBackend;
  }

  /**
   * @param {Boolean} state
   */
  set localBackend(state) {
    this._localBackend = state;
  }

  /**
   * @returns {String}
   */
  get name() {
    return this.constructor.name.toLowerCase();
  }

  /**
   * @returns {Object}
   */
  get service() {
    return this;
  }

  /**
   * Booting a certain service
   *
   * @param {Kernel} kernel
   * @param {Function} callback
   */
  boot(kernel, callback) {
    // @todo: override in child service
    callback();
  }

  /**
   * @param {Instance} microservice
   * @returns {Injectable}
   */
  bind(microservice) {
    // @todo: find more smart way of doing this...
    if (typeof microservice === 'string') {
      microservice = this._container.get(Kernel.KERNEL).microservice(microservice);
    }

    return super.bind(microservice);
  }

  /**
   * @param {String} object
   * @returns {String}
   * @private
   */
  _resolvePath(object) {
    if (typeof object === 'string' && object.indexOf('@') === 0) {
      let parts = object.match(/^@\s*([^:]+)\s*:\s*([^\s]+)\s*$/);

      if (parts.length === 3) {
        this.bind(parts[1]);

        return parts[2];
      }
    }

    return object;
  }

  /**
   * @param {DI} container
   */
  set container(container) {
    this._container = container;
  }

  /**
   * @returns {DI}
   */
  get container() {
    return this._container;
  }

  /**
   * @param {Array} args
   * @returns {*}
   */
  get(...args) {
    return this._container.get(...args);
  }
}
