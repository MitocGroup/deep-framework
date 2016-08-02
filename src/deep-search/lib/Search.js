/**
 * Created by mgoria on 3/4/16.
 */

'use strict';

import Kernel from 'deep-kernel';
import Core from 'deep-core';
import {Elasticsearch as ElasticSearchClient} from './Client/Elasticsearch';
import {UnknownSearchDomainException} from './Exception/UnknownSearchDomainException';
import {MissingSearchClientException} from './Exception/MissingSearchClientException';
import {NotReadySearchDomainException} from './Exception/NotReadySearchDomainException';
import util from 'util';

/**
 * Deep Search implementation
 */
export class Search extends Kernel.ContainerAware {
  /**
   * @param {Object} domains
   *
   * @example domains = {
   *  rum: {
   *    type: 'es|cloudsearch',
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
   * @param {String|Function} domainName
   * @param {Function} callback
   */
  getClient(domainName, callback) {
    // use 'client' as default domainName
    if (typeof domainName === 'function') {
      callback = domainName;
      domainName = 'client';
    }

    if (this._domainClients.indexOf(domainName) !== -1) {
      callback(null, this._domainClients[domainName]);
      return;
    }

    this._createClient(domainName, (error, client) => {
      if (!error) {
        this._domainClients[domainName] = client;
      }

      callback(error, client);
    });
  }

  /**
   * @param {String} domainName
   * @param {Function} callback
   * @private
   */
  _createClient(domainName, callback) {
    if (!this._domains.hasOwnProperty(domainName)) {
      callback(new UnknownSearchDomainException(domainName, Object.keys(this._domains)));
      return;
    }

    let domainConfig = this._domains[domainName];

    this.kernel.loadAsyncConfig((asyncConfig) => {
      if (asyncConfig && asyncConfig.searchDomains && asyncConfig.searchDomains.hasOwnProperty(domainName)) {
        let client = null;
        domainConfig = util._extend(domainConfig, asyncConfig.searchDomains[domainName]);

        if (!domainConfig.hasOwnProperty('url')) {
          callback(new NotReadySearchDomainException(domainConfig.name, domainConfig.type));
          return;
        }

        if (domainConfig.type === Core.AWS.Service.ELASTIC_SEARCH) {
          client = new ElasticSearchClient(domainConfig.url, this.clientDecorator, !this.localBackend);
        }

        if (!client) {
          callback(new MissingSearchClientException(domainConfig.name, domainConfig.type));
          return;
        }

        callback(null, client);
      } else {
        callback(new NotReadySearchDomainException(domainConfig.name, domainConfig.type));
      }
    });
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

        instance[originalFunctionName](...args);
      };
    }

    return func;
  }
}
