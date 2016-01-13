/**
 * Created by AlexanderC on 1/12/16.
 */

'use strict';

import {Cursor} from './Cursor';
import {NativeParameter} from './NativeParameter';
import {Expr} from './Expr';
import {Item as ExprItem} from './Expr/Item';
import {Item as HighlightItem} from './Highlight/Item';
import {Facet} from './Facet';
import {Highlight} from './Highlight';
import {QueryOptions} from './QueryOptions';
import {Query} from './Query';
import util from 'util';

export class Builder {
  constructor() {
    this._cursor = null;
    this._size = null;
    this._start = null;
    this._expr = null;
    this._facet = null;
    this._highlight = null;
    this._partial = null;
    this._queryOptions = null;
    this._filterQuery = null;

    this._query = Query.create();
    this._sort = [];
    this._return = [Builder.RETURN_ALL,];
  }

  /**
   * @param {String} field
   * @param {String} type
   * @returns {Builder}
   */
  sortBy(field, type = Builder.SORT_ASC) {
    type = type.toLowerCase();

    if (type !== Builder.SORT_ASC && type !== Builder.SORT_DESC) {
      throw new Error(
        `Unknown sort type ${type}. Allowed: ${Builder.SORT_ASC}, ${Builder.SORT_DESC}`
      );
    }

    this._sort.push(`${field} ${type}`);

    return this;
  }

  /**
   * Return specific fields
   *
   * @param {String|*} fields
   * @returns {Builder}
   */
  returnFields(...fields) {
    if (fields.length <= 0) {
      return this;
    }

    if (this._return.length === 1 && this._return[0] === Builder.RETURN_ALL) {
      this._return = [];
    }

    fields.forEach((field) => {
      this._return.push(field.toString());
    });

    return this;
  }

  /**
   * Return result score only
   *
   * @returns {Builder}
   */
  returnScore() {
    return this.returnFields(Builder.RETURN_SCORE);
  }

  /**
   * Return only doc ids
   *
   * @returns {Builder}
   */
  returnIdOnly() {
    this._return = [Builder.RETURN_ID_ONLY,];

    return this;
  }

  /**
   * Reset query and use a simple query parser
   *
   * @param {String|Function} valueOrClosure
   * @returns {Builder}
   */
  simpleQuery(valueOrClosure) {
    this._query = Query.create(Query.SIMPLE);

    return this.query(valueOrClosure);
  }

  /**
   * Reset query and use a dismax query parser
   *
   * @param {String|Function} valueOrClosure
   * @returns {Builder}
   */
  dismaxQuery(valueOrClosure) {
    this._query = Query.create(Query.DISMAX);

    return this.query(valueOrClosure);
  }

  /**
   * Reset query and use a structured query parser
   *
   * @param {String|Function} valueOrClosure
   * @returns {Builder}
   */
  structuredQuery(valueOrClosure) {
    this._query = Query.create(Query.STRUCTURED);

    return this.query(valueOrClosure);
  }

  /**
   * Reset query and use a lucene query parser
   *
   * @param {String|Function} valueOrClosure
   * @returns {Builder}
   */
  luceneQuery(valueOrClosure) {
    this._query = Query.create(Query.LUCENE);

    return this.query(valueOrClosure);
  }

  /**
   * Query to search for
   *
   * @param {String|Function} valueOrClosure
   * @returns {Builder}
   *
   * @example qb.query('some text to search')
   *
   * @example qb.query((query) => {
   *  query.query('some text to search');
   * })
   */
  query(valueOrClosure) {
    if (typeof valueOrClosure === 'function') {
      valueOrClosure(this._query);
    } else {
      this._query.query(valueOrClosure);
    }

    return this;
  }

  /**
   * Specifies a structured query that filters the results of a
   * search without affecting how the results are scored and sorted
   *
   * @param {String|Function} valueOrClosure
   * @returns {Builder}
   *
   * @example qb.filterQuery("available:'true'")
   *
   * @example qb.filterQuery((filterQuery) => {
   *  filterQuery.query("available:'true'");
   * })
   */
  filterQuery(valueOrClosure) {
    this._filterQuery = this._filterQuery || Query.create(Query.STRUCTURED);

    if (typeof valueOrClosure === 'function') {
      valueOrClosure(this._filterQuery);
    } else {
      this._filterQuery.query(valueOrClosure);
    }

    return this;
  }

  /**
   * @param {Function} closure
   * @returns {Builder}
   *
   * @example qb.queryOptions((options) => {
   *    options.field('title', 3).defaultOperator('and');
   * })
   */
  queryOptions(closure) {
    this._queryOptions = this._queryOptions || new QueryOptions();

    closure(this._queryOptions);

    return this;
  }

  /**
   * Enables partial results to be returned if one or more index partitions are unavailable.
   * By default the query fails with 5xx when unavailable
   *
   * @returns {Builder}
   */
  partial() {
    this._partial = true;

    return this;
  }

  /**
   * Highlight on or multiple fields
   *
   * @param {String|Function} field
   * @param {Function} closure
   * @returns {Builder}
   *
   * @example qb.highlight('title')
   *
   * @example qb.highlight('title', (highlight) => {
   *    highlight.maxOccurrences(2).plain();
   * })
   *
   * @example qb.highlight((highlights) => {
   *    highlights.add('title', (highlight) => {
   *      highlight.maxOccurrences(2).plain();
   *    });
   * })
   */
  highlight(field, closure = () => {}) {
    this._highlight = this._highlight || new Highlight();

    // case only a closure is provided
    if (typeof field === 'function') {
      field(this._highlight);
    } else {
      this._highlight.add(field, closure);
    }

    return this;
  }

  /**
   * Retrieve facet information
   *
   * @param {String|Function} field
   * @param {Function} closure
   * @returns {Builder}
   *
   * @example qb.facet('year', (facet) => {
   *    facet.sortByCount().top(3);
   * })
   *
   * @example qb.facet((facets) => {
   *    facets.add('year', (facet) => {
   *      facet.sortByCount().top(3);
   *    });
   * })
   */
  facet(field, closure = null) {
    this._facet = this._facet || new Facet();

    // case only a closure is provided
    if (typeof field === 'function') {
      field(this._facet);
    } else {
      this._facet.add(field, closure);
    }

    return this;
  }

  /**
   * Sort results or specify search or filter criteria (single expression)
   *
   * @param {String} value
   * @returns {Builder}
   *
   * @example qb.expr('(0.3*popularity)+(0.7*_score)')
   */
  expr(value) {
    this._expr = new Expr().value(value);

    return this;
  }

  /**
   * Sort results or specify search or filter criteria (multiple expressions)
   *
   * @param {String} value
   * @param {String} name
   * @returns {Builder}
   *
   * @example qb.addExpr('(0.3*popularity)+(0.7*_score)', 'expression1')
   */
  addExpr(value, name = null) {
    this._expr = this._expr || new Expr();

    this._expr.add(value, name);

    return this;
  }

  /**
   * Result set size
   *
   * @param {Number} size
   * @returns {Builder}
   *
   * @example qb.size(100)
   */
  size(size) {
    this._size = Math.abs(parseInt(size));

    return this;
  }

  /**
   * Result set offset
   *
   * @param {Number} offset
   * @returns {Builder}
   *
   * @example qb.offset(200)
   */
  offset(offset) {
    this._start = Math.abs(parseInt(offset));

    this._size = this._size || Builder.DEFAULT_SIZE;
    this._cursor = null;

    return this;
  }

  /**
   * Cursors are used to page through the large
   * result sets
   *
   * @returns {Builder}
   *
   * @example qb.useCursor()
   *          qb.useCursor('some_cursor_value')
   */
  useCursor(cursorVal = null) {
    this._cursor = cursorVal ? new Cursor(cursorVal) : new Cursor();

    this._size = this._size || Builder.DEFAULT_SIZE;
    this._start = null;

    return this;
  }

  /**
   * @returns {Number}
   */
  static get DEFAULT_SIZE() {
    return 100;
  }

  /**
   * @returns {String}
   */
  static get EXPR_SCORE() {
    return ExprItem.SCORE;
  }

  /**
   * @returns {String}
   */
  static get EXPR_NOW() {
    return ExprItem.NOW;
  }

  /**
   * @returns {String}
   */
  static get EXPR_RANDOM() {
    return ExprItem.RANDOM;
  }

  /**
   * @returns {String}
   */
  static get HIGHLIGHT_TEXT() {
    return HighlightItem.TEXT;
  }

  /**
   * @returns {String}
   */
  static get RETURN_ALL() {
    return 'all_fields';
  }

  /**
   * @returns {String}
   */
  static get RETURN_ID_ONLY() {
    return 'no_fields';
  }

  /**
   * @returns {String}
   */
  static get RETURN_SCORE() {
    return '_score';
  }

  /**
   * @returns {String}
   */
  static get SORT_ASC() {
    return 'asc';
  }

  /**
   * @returns {String}
   */
  static get SORT_DESC() {
    return 'desc';
  }

  /**
   * @param {Object} payload
   * @param {Object} indexes
   * @param {String} key
   * @param {*} val
   * @returns {Builder}
   * @private
   */
  _payloadInject(payload, indexes, key, val) {
    if (val !== null) {
      if (util.isArray(val)) {
        if (val.length > 0) {
          payload[key] = val.map((str) => Builder._swapIndexFields(indexes, str)).join(',');
        }
      } else if (typeof val === 'object' && val instanceof NativeParameter) {
        payload[key] = val.export(indexes);
      } else {
        payload[key] = Builder._swapIndexFields(indexes, val);
      }
    }

    return this;
  }

  /**
   * @param {Object} indexes
   * @param {String} str
   * @returns {String}
   */
  static _swapIndexFields(indexes, str) {
    if (typeof str !== 'string') {
      return str;
    }

    for (let field in indexes) {
      if (!indexes.hasOwnProperty(field)) {
        continue;
      }

      let realField = indexes[field];

      str = str.replace(
        new RegExp(`^(.*[^a-z0-9_])?(${field})([^a-z0-9_].*)?$`, 'gi'),
        `$1${realField}$3`
      );
    }

    return str;
  }

  /**
   * @returns {Object}
   */
  generateSearchPayload(indexes = {}) {
    let payload = {
      queryParser: this._query.type,
      query: this._query.export(indexes),
    };

    this
      ._payloadInject(payload, indexes, 'cursor', this._cursor)
      ._payloadInject(payload, indexes, 'size', this._size)
      ._payloadInject(payload, indexes, 'start', this._start)
      ._payloadInject(payload, indexes, 'sort', this._sort)
      ._payloadInject(payload, indexes, 'expr', this._expr)
      ._payloadInject(payload, indexes, 'facet', this._facet)
      ._payloadInject(payload, indexes, 'highlight', this._highlight)
      ._payloadInject(payload, indexes, 'partial', this._partial)
      ._payloadInject(payload, indexes, 'queryOptions', this._queryOptions)
      ._payloadInject(payload, indexes, 'return', this._return)
      ._payloadInject(payload, indexes, 'filterQuery', this._filterQuery)
    ;

    return payload;
  }
}
