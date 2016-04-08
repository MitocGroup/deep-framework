/**
 * Created by AlexanderC on 6/10/15.
 */

'use strict';

import {Instance} from './Instance';
import Core from 'deep-core';
import {MissingWorkingMicroserviceException} from './Exception/MissingWorkingMicroserviceException';

/**
 * Microservice injectable object
 */
export class Injectable {
  constructor() {
    this._microservice = null;
  }

  /**
   * @param {Instance} microservice
   * @returns {Injectable}
   */
  bind(microservice) {
    this.microservice = microservice;

    return this;
  }

  /**
   * @returns {Instance}
   */
  get microservice() {
    if (this._microservice === null) {
      throw new MissingWorkingMicroserviceException();
    }

    return this._microservice;
  }

  /**
   * @param {Instance} instance
   */
  set microservice(instance) {
    if (!(instance instanceof Instance)) {
      throw new Core.Exception.InvalidArgumentException(instance, 'Microservice');
    }

    this._microservice = instance;
  }
}
