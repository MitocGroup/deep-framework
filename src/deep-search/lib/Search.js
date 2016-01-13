/**
 * Created by mgoria on 5/28/15.
 */

'use strict';

import Kernel from 'deep-kernel';
import {DomainConsumer} from './CloudSearch/DomainConsumer';
import {DomainConfig} from './CloudSearch/DomainConfig';
import {MissingDomainException} from './Exception/MissingDomainException';

export class Search extends Kernel.ContainerAware {
  constructor() {
    super();

    this._domainsConfig = {};
    this._domainsConsumers = {};
  }

  /**
   * @returns {Object|null}
   */
  get domainsConfig() {
    return this._domainsConfig;
  }

  /**
   * @param {String} name
   * @returns {DomainConfig}
   */
  domainConfig(name) {
    if (null === this._domainsConfig) {
      throw new Error('Domains config available in backend only!');
    }

    if (!this._domainsConfig.hasOwnProperty(name)) {
      throw new MissingDomainException(name);
    }

    return this._domainsConfig[name];
  }

  /**
   * @returns {Object}
   */
  get domains() {
    return this._domainsConsumers;
  }

  /**
   * @param {String} name
   * @returns {Boolean}
   */
  hasDomain(name) {
    return this._domainsConsumers.hasOwnProperty(name);
  }

  /**
   * @param {String} name
   * @returns {DomainConsumer}
   */
  domain(name) {
    if (!this._domainsConsumers.hasOwnProperty(name)) {
      throw new MissingDomainException(name);
    }

    return this._domainsConsumers[name];
  }

  /**
   * Booting a certain service
   *
   * @param {Kernel} kernel
   * @param {Function} callback
   */
  boot(kernel, callback) {
    let config = kernel.config.search;

    for (let modelName in config) {
      if (!config.hasOwnProperty(modelName)) {
        continue;
      }

      let domainConfig = config[modelName];

      this._domainsConsumers[modelName] = DomainConsumer.createFromSearchConfig(domainConfig);

      if (kernel.isBackend) {
        this._domainsConfig[modelName]= DomainConfig.createFromSearchConfig(domainConfig);
      }
    }

    if (!kernel.isBackend) {
      this._domainsConfig = null;
    }

    callback();
  }
}
