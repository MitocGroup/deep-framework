/**
 * Created by AlexanderC on 1/13/16.
 */

'use strict';

import {Response} from './Query/Response';

export class Query {
  /**
   * @param {AWS.CloudSearchDomain} cloudSearchDomain
   * @param {Object} indexes
   * @param {QueryBuilder} queryBuilder
   */
  constructor(cloudSearchDomain, indexes, queryBuilder) {
    this._cloudSearchDomain = cloudSearchDomain;
    this._queryBuilder = queryBuilder;
    this._indexes = indexes;
  }

  /**
   * @param {Function} callback
   * @returns {Query}
   */
  execute(callback) {
    this._cloudSearchDomain.search(this._payload, (error, data) => {
      callback(new Response(this, error, data));
    });

    return this;
  }

  /**
   * @returns {QueryBuilder}
   */
  get queryBuilder() {
    return this._queryBuilder;
  }

  /**
   * @returns {Object}
   */
  get indexes() {
    return this._indexes;
  }

  /**
   * @returns {Object}
   * @private
   */
  get _payload() {
    return this._queryBuilder
      .generateSearchPayload(this._indexes);
  }
}
