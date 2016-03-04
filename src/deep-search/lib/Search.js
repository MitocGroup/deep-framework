/**
 * Created by mgoria on 3/4/16.
 */

'use strict';

import Kernel from 'deep-kernel';
import {Elasticsearch as ElasticSearchClient} from 'Client/Elasticsearch';

/**
 * Deep Search implementation
 */
export class Search extends Kernel.ContainerAware {
  /**
   * @param {Array} domains
   */
  constructor(domains) {
    super();

    this._domains = domains;

    this._rumEsClient = null;
  }

  /**
   * @param {Kernel} kernel
   * @param {Function} callback
   */
  boot(kernel, callback) {
    this._domains = kernel.esDomains;

    callback();
  }

  /**
   * @returns {ElasticSearchClient}
   */
  get rumEsClient() {
    if (!this._rumEsClient) {
      this._rumEsClient = new ElasticSearchClient(this._domains.rum);
    }

    return this._rumEsClient;
  }
}