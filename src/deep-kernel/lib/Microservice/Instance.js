/**
 * Created by AlexanderC on 6/10/15.
 */

'use strict';

import Core from 'deep-core';
import {Injectable} from './Injectable';

/**
 * Microservice instance class
 */
export class Instance {
  /**
   * @param {String} identifier
   * @param {Object} rawResources
   */
  constructor(identifier, rawResources) {
    this._isRoot = false;
    this._rawResources = rawResources;
    this._identifier = identifier;
  }

  /**
   * @param {Object} globalConfig
   * @returns {Instance[]}
   */
  static createVector(globalConfig) {
    let vector = [];

    for (let identifier in globalConfig.microservices) {
      if (!globalConfig.microservices.hasOwnProperty(identifier)) {
        continue;
      }

      let microservice = globalConfig.microservices[identifier];

      let microserviceObject = new Instance(identifier, microservice.resources);
      microserviceObject.isRoot = microservice.isRoot;

      vector.push(microserviceObject);
    }

    return vector;
  }

  /**
   * @param {Object} objectInstance
   * @return {Object}
   */
  inject(objectInstance) {
    if (!(objectInstance instanceof Injectable)) {
      throw new Core.Exception.InvalidArgumentException(objectInstance, 'deep-kernel.Injectable');
    }

    objectInstance.microservice = this;

    return objectInstance;
  }

  /**
   * @returns {String}
   */
  toString() {
    return this._identifier;
  }

  /**
   * @returns {Object}
   */
  get rawResources() {
    return this._rawResources;
  }

  /**
   * @returns {String}
   */
  get identifier() {
    return this._identifier;
  }

  /**
   * @param {Boolean} state
   */
  set isRoot(state) {
    this._isRoot = state;
  }

  /**
   * @returns {Boolean}
   */
  get isRoot() {
    return this._isRoot;
  }
}
