/**
 * Created by AlexanderC on 1/12/16.
 */

'use strict';

import {NativeParameter} from './NativeParameter';
import {SimpleQuery} from './Query/SimpleQuery';
import {StructuredQuery} from './Query/StructuredQuery';
import {LuceneQuery} from './Query/LuceneQuery';
import {DisMaxQuery} from './Query/DisMaxQuery';

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
    let type = null;

    if (this instanceof SimpleQuery) {
      type = Query.SIMPLE;
    } else if (this instanceof StructuredQuery) {
      type = Query.STRUCTURED;
    } else if (this instanceof LuceneQuery) {
      type = Query.LUCENE;
    } else if (this instanceof DisMaxQuery) {
      type = Query.DISMAX;
    }

    return type;
  }

  /**
   * @param {String} type
   * @param {*} args
   * @returns {Query|SimpleQuery|StructuredQuery|LuceneQuery|DisMaxQuery}
   */
  static create(type = Query.SIMPLE, ...args) {
    let Proto = null;

    switch(type.toLowerCase()) {
      case Query.SIMPLE:
        Proto = new SimpleQuery();
        break;
      case Query.STRUCTURED:
        Proto = new StructuredQuery();
        break;
      case Query.LUCENE:
        Proto = new LuceneQuery();
        break;
      case Query.DISMAX:
        Proto = new DisMaxQuery();
        break;
      default: throw new Error(`Unknown CloudSearch query type ${type}. Available: ${Query.TYPES.join(', ')}`);
    }

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

  /**
   * @returns {String}
   */
  export() {
    return this._query.toString();
  }
}
