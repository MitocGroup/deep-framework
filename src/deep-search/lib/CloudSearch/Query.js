/**
 * Created by AlexanderC on 1/12/16.
 */

'use strict';

import {NativeParameter} from './NativeParameter';

export class Query extends NativeParameter {
  constructor() {
    super();

    this._query = null;
  }

  /**
   * @param {String} query
   * @returns {Query}
   */
  query(query) {
    this._query = query;

    return this;
  }

  /**
   * @returns {String}
   */
  get type() {
    return null;
  }

  /**
   * @param {String} type
   * @param {*} args
   * @returns {Query|SimpleQuery|StructuredQuery|LuceneQuery|DisMaxQuery}
   */
  static create(type = Query.SIMPLE, ...args) {
    let name = null;

    switch(type.toLowerCase()) {
      case Query.SIMPLE:
        name = 'Simple';
        break;
      case Query.STRUCTURED:
        name = 'Structured';
        break;
      case Query.LUCENE:
        name = 'Lucene';
        break;
      case Query.DISMAX:
        name = 'DisMax';
        break;
      default: throw new Error(`Unknown CloudSearch query type ${type}. Available: ${Query.TYPES.join(', ')}`);
    }

    let Proto = require(`./Query/${name}Query`)[`${name}Query`];

    return new Proto(...args);
  }

  /**
   * @returns {String}
   */
  static get SIMPLE() {
    return 'simple';
  }

  /**
   * @returns {String}
   */
  static get STRUCTURED() {
    return 'structured';
  }

  /**
   * @returns {String}
   */
  static get LUCENE() {
    return 'lucene';
  }

  /**
   * @returns {String}
   */
  static get DISMAX() {
    return 'dismax';
  }

  static get TYPES() {
    return [Query.SIMPLE, Query.STRUCTURED, Query.LUCENE, Query.DISMAX,];
  }

  /**
   * @returns {String}
   */
  export() {
    return this._query.toString();
  }
}
