/**
 * Created by AlexanderC on 1/12/16.
 */

'use strict';

import {Response as BaseResponse} from '../Response';
import {IndexNameNormalizer} from '../IndexNameNormalizer';

export class Response extends BaseResponse {
  /**
   * @param {Query} query
   * @param {Error|null} error
   * @param {Object} data
   */
  constructor(query, error, data) {
    super(error, data);

    this._query = query;

    this._start = null;
    this._cursor = null;
    this._totalMatched = 0;
    this._hits = [];
    this._facets = {};

    if (data) {
      this._manageHitsAndFacets(data);
    }
  }

  /**
   * @returns {Number}
   */
  get totalMatched() {
    return this._totalMatched;
  }

  /**
   * @returns {String}
   */
  get cursor() {
    return this._cursor;
  }

  /**
   * @returns {Number}
   */
  get start() {
    return this._start;
  }

  /**
   * @returns {Object}
   */
  get facets() {
    return this._facets;
  }

  /**
   * @returns {Array}
   */
  get hits() {
    return this._hits;
  }

  /**
   * @returns {Query}
   */
  get query() {
    return this._query;
  }

  /**
   * Scroll to the next result set
   *
   * @param callback
   * @returns {Response}
   */
  scroll(callback) {
    let qb = this._query.queryBuilder;

    if (this._cursor) {
      qb.useCursor(this._cursor);
    } else {
      qb.offset(this._start + this._hits.length);
    }

    this._query.execute(callback);

    return this;
  }

  /**
   * @param {Object} data
   * @private
   */
  _manageHitsAndFacets(data) {
    (new IndexNameNormalizer(this._query.indexes))
      .normalizeSearchResponseData(data);

    if (data.hits) {
      this._totalMatched = data.hits.found;
      this._start = data.hits.start;
      this._cursor = data.hits.cursor;

      this._hits = data.hits.hit;
    }

    if (data.facets) {
      this._facets = data.facets;
    }
  }
}
