/**
 * Created by AlexanderC on 1/12/16.
 */

'use strict';

import AWS from 'aws-sdk';
import {MissingSuggesterException} from './Exception/MissingSuggesterException';
import {Suggestion} from './Suggestion';
import {Builder as QueryBuilder} from './QueryBuilder/Builder';
import {Query} from './Query';

export class DomainConsumer {
  /**
   * @param {AWS.CloudSearchDomain} cloudSearchDomain
   * @param {Object} indexes
   * @param {Object} suggesters
   */
  constructor(cloudSearchDomain, indexes, suggesters) {
    this._cloudSearchDomain = cloudSearchDomain;
    this._indexes = indexes;
    this._suggesters = suggesters;
  }

  /**
   * @returns {QueryBuilder}
   */
  createQueryBuilder() {
    return new QueryBuilder();
  }

  /**
   * @param {QueryBuilder} queryBuilder
   */
  query(queryBuilder) {
    return new Query(
      this._cloudSearchDomain,
      this._indexes,
      queryBuilder
    );
  }

  /**
   * @param {String} field
   * @returns {Suggestion}
   */
  autocomplete(field) {
    return new Suggestion(
      this._cloudSearchDomain,
      this._suggesters.hasOwnProperty(field) ? this._suggesters[field] : field
    );
  }

  /**
   * @returns {Object}
   */
  get indexes() {
    return this._indexes;
  }

  /**
   * @returns {Object}
   */
  get suggesters() {
    return this._suggesters;
  }

  /**
   * @param {Object} config
   */
  static createFromSearchConfig(config) {
    let endpoint = config.hasOwnProperty('endpoints') ? config.endpoints.search : config.endpoint;
    let indexes = config.indexes;
    let suggesters = config.suggesters;

    return new DomainConsumer(new AWS.CloudSearchDomain({
      endpoint: endpoint,
    }), indexes, suggesters);
  }
}
