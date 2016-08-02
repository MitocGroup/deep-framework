/**
 * Created by AlexanderC on 6/10/15.
 */

'use strict';

import {Injectable as MicroserviceInjectable} from './Microservice/Injectable';
import {InvalidDeepIdentifierException} from './Exception/InvalidDeepIdentifierException';

/**
 * @todo - rename it to AbstractService (ContainerAware doesn't make sense anymore)
 *
 * Container aware instance
 */
export class ContainerAware extends MicroserviceInjectable {
  constructor() {
    super();

    this._kernel = null;
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
   * @param {Object|String} microservice
   * @returns {Injectable}
   */
  bind(microservice) {

    // @todo: find more smart way of doing this...
    if (typeof microservice === 'string') {
      microservice = this.kernel.microservice(microservice);
    }

    return super.bind(microservice);
  }

  /**
   * @param {String} identifier (e.g. @microservice_identifier:resource[:action])
   * @returns {String}
   *
   * @private
   */
  _resolveIdentifier(identifier) {
    let regExp = /^@\s*([^:]+)\s*:\s*([^\s]+)\s*$/;

    if (typeof identifier === 'string' && regExp.test(identifier)) {
      let parts = identifier.match(regExp);

      this.bind(parts[1]); // microservice identifier

      return parts[2]; // resource identifier
    } else {
      throw new InvalidDeepIdentifierException(identifier);
    }
  }

  /**
   * @returns {DI|null}
   */
  get container() {
    return this._kernel ? this._kernel.container : null;
  }

  /**
   * @param {Kernel} kernel
   */
  set kernel(kernel) {
    this._kernel = kernel;
  }

  /**
   * @returns {Kernel}
   */
  get kernel() {
    return this._kernel;
  }

  /**
   * @param {Array} args
   * @returns {*}
   */
  get(...args) {
    return this.container.get(...args);
  }
}
