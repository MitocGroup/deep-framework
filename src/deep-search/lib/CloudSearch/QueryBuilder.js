/**
 * Created by AlexanderC on 1/12/16.
 */

'use strict';

import {Cursor} from './Cursor';
import {NativeParameter} from './NativeParameter';
import {Expr} from './Expr';
import {Item as ExprItem} from './Expr/Item';
import {Facet} from './Facet';
import {Highlight} from 'Highlight';

export class QueryBuilder {
  constructor() {
    this._cursor = null;
    this._size = null;
    this._start = null;
    this._expr = null;
    this._facet = null;
    this._highlight = null;
    this._partial = null;


    // @todo: TBD
    this._query = null;
    this._filterQuery = null;
  }

  /**
   * Enables partial results to be returned if one or more index partitions are unavailable.
   * By default the query fails with 5xx when unavailable
   *
   * @returns {QueryBuilder}
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
   * @returns {QueryBuilder}
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

      return this;
    }

    this._highlight.add(field, closure);

    return this;
  }

  /**
   * Retrieve facet information
   *
   * @param {String|Function} field
   * @param {Function} closure
   * @returns {QueryBuilder}
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

      return this;
    }

    this._facet.add(field, closure);

    return this;
  }

  /**
   * Sort results or specify search or filter criteria (single expression)
   *
   * @param {String} value
   * @returns {QueryBuilder}
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
   * @returns {QueryBuilder}
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
   * @returns {QueryBuilder}
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
   * @returns {QueryBuilder}
   *
   * @example qb.offset(200)
   */
  offset(offset) {
    this._start = Math.abs(parseInt(offset));

    this._size = this._size || QueryBuilder.DEFAULT_SIZE;
    this._cursor = null;

    return this;
  }

  /**
   * Cursors are used to page through the large
   * result sets
   *
   * @returns {QueryBuilder}
   *
   * @example qb.useCursor()
   *          qb.useCursor('some_cursor_value')
   */
  useCursor(cursorVal = null) {
    this._cursor = cursorVal ? new Cursor(cursorVal) : new Cursor();

    this._size = this._size || QueryBuilder.DEFAULT_SIZE;
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
   * @param {Object} payload
   * @param {String} key
   * @param {*} val
   * @returns {QueryBuilder}
   * @private
   */
  _payloadInject(payload, key, val) {
    if (val === null) {
      return this;
    } else if (typeof val === 'object' && val instanceof NativeParameter) {
      payload[key] = val.export();
    }

    payload[key] = val;

    return this;
  }

  /**
   * @returns {Object}
   */
  get searchPayload() {
    let payload = {};

    this
      ._payloadInject(payload, 'cursor', this._cursor)
      ._payloadInject(payload, 'size', this._size)
      ._payloadInject(payload, 'start', this._start)
      ._payloadInject(payload, 'expr', this._expr)
      ._payloadInject(payload, 'facet', this._facet)
      ._payloadInject(payload, 'highlight', this._highlight)
      ._payloadInject(payload, 'partial', this._partial)
    ;

    return payload;
  }
}
