/**
 * Created by mgoria on 3/4/16.
 */

'use strict';

import Kernel from 'deep-kernel';
import {Elasticsearch as ElasticSearchClient} from './Client/Elasticsearch';
import {UnknownSearchDomainException} from './Exception/UnknownSearchDomainException';
import {MissingSearchClientException} from './Exception/MissingSearchClientException';

/**
 * Deep Search implementation
 */
export class Search extends Kernel.ContainerAware {
  /**
   * @param {Object} domains
   *
   * @example domains = {
   *  rum: {
   *    name: '<DomainName>',
   *    url: '<DomainUrl>'
   *  },
   *  ...
   * }
   */
  constructor(domains) {
    super();

    this._domains = domains;
    this._domainClients = [];
  }

  /**
   * @param {Kernel} kernel
   * @param {Function} callback
   */
  boot(kernel, callback) {
    this._domains = kernel.config.searchDomains || {};

    callback();
  }

  /**
   * @param {String} domainName
   * @returns {ElasticSearchClient}
   */
  getClient(domainName) {
    if (this._domainClients.indexOf(domainName) === -1) {
      this._domainClients[domainName] = this._createClient(domainName);
    }

    return this._domainClients[domainName];
  }

  /**
   * @param {String} domainName
   * @returns {ElasticSearchClient}
   * @private
   */
  _createClient(domainName) {
    if (!this._domains.hasOwnProperty(domainName)) {
      throw new UnknownSearchDomainException(domainName, Object.keys(this._domains));
    }

    let client = null;
    let domainUrl = this._domains[domainName].url;

    // @todo - use below check when domain url will be available
    //if (domainUrl.indexOf('es.amazonaws.com') !== -1) {
      client = new ElasticSearchClient(domainUrl, this.clientDecorator);
    //}

    if (!client) {
      throw new MissingSearchClientException(domainUrl);
    }

    return client;
  }

  /**
   * @returns {Function}
   */
  get clientDecorator() {
    let func = null;

    if (this.kernel && this.kernel.isRumEnabled) {
      func = function(instance, originalFunctionName, ...args) {
        // RUM log ...

        let originalCallback = null;

        // seeking the callback function through the arguments and proxy it
        args.forEach((arg, index) => {
          if (typeof arg === 'function') {
            originalCallback = arg;

            args[index] = (...cbArgs) => {
              // RUM log ...

              originalCallback.call(instance, ...cbArgs);
            };
          }
        });

        originalFunctionName.call(instance, ...args);
      };
    }

    return func;
  }
}