/**
 * Created by mgoria on 3/4/16.
 */

'use strict';

import Kernel from 'deep-kernel';
import {Elasticsearch as ElasticSearchClient} from 'Client/Elasticsearch';
import {UnknownSearchDomainException} from 'Exception/UnknownSearchDomainException';

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
    this._domains = kernel.searchDomains || {};

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
    if (this._domains.indexOf(domainName) === -1) {
      throw new UnknownSearchDomainException(domainName, Object.keys(this._domains));
    }

    // @todo create ES or CloudSearch client based on domainUrl
    return new ElasticSearchClient(this._domains[domainName].url);
  }
}