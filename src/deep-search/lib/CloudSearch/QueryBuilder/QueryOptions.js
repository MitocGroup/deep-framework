/**
 * Created by AlexanderC on 1/12/16.
 */

'use strict';

import {NativeParameter} from './NativeParameter';

export class QueryOptions extends NativeParameter {
  constructor() {
    super();

    this._options = {};
  }

  /**
   * @param {Number} num
   * @returns {QueryOptions}
   *
   * @example options.tieBreaker(0.4)
   */
  tieBreaker(num) {
    num = Math.abs(parseFloat(num));

    if (num < 0 || num > 1) {
      throw new Error('Query options tieBreaker (dismax) accept values from 0.0 to 1.0');
    }

    this._options['tieBreaker'] = num;

    return this;
  }

  /**
   * An integer value that specifies how much a match can deviate from the search
   * phrase when the phrase is enclosed in double quotes in the search string.
   *
   * Valid for dismax only!
   *
   * @param {Number} slop
   * @returns {QueryOptions}
   */
  explicitPhraseSlop(slop) {
    this._options['explicitPhraseSlop'] = Math.abs(parseInt(slop));

    return this;
  }

  /**
   * An integer value that specifies how much matches
   * can deviate from the search phrase and still be boosted according to the weights specified
   *
   * Valid for dismax only!
   *
   * @param {Number} slop
   * @returns {QueryOptions}
   */
  phraseSlop(slop) {
    this._options['phraseSlop'] = Math.abs(parseInt(slop));

    return this;
  }

  /**
   * Operators or special characters you want to disable for the simple query parser
   *
   * @param {String|*} operators
   * @returns {QueryOptions}
   *
   * @example options.disableOperatorOrSpecial('and', '-', '|')
   */
  disableOperatorOrSpecial(...operators) {
    if (!this._options.hasOwnProperty('operators')) {
      this._options['operators'] = [];
    }

    operators.forEach((operator) => {
      this._options['operators'].push(operator.toString());
    });

    return this;
  }

  /**
   * Default operator
   *  simple, structured, lucene: or, and
   *  dismax: 0-100
   *
   * @param {String|Number} operator
   * @returns {QueryOptions}
   */
  defaultOperator(operator) {
    this._options['defaultOperator'] = operator;

    return this;
  }

  /**
   * @param {String} name
   * @param {Number} weight
   * @returns {QueryOptions}
   *
   * @example options.phraseField('title', 3)
   * @example options.phraseField('plot')
   */
  phraseField(name, weight = null) {
    if (weight !== null) {
      name = `${name}^${Math.abs(parseInt(weight))}`;
    }

    return this.phraseFields(name);
  }

  /**
   * Fields you want to use for phrase searches
   *
   * @param {String|*} fields
   * @returns {QueryOptions}
   *
   * @example options.phraseFields('title^3', 'plot')
   */
  phraseFields(...fields) {
    if (!this._options.hasOwnProperty('phraseFields')) {
      this._options['phraseFields'] = [];
    }

    fields.forEach((field) => {
      this._options['phraseFields'].push(field);
    });

    return this;
  }

  /**
   * @param {String} name
   * @param {Number} weight
   * @returns {QueryOptions}
   *
   * @example options.field('title', 3)
   * @example options.field('description')
   */
  field(name, weight = null) {
    if (weight !== null) {
      name = `${name}^${Math.abs(parseInt(weight))}`;
    }

    return this.fields(name);
  }

  /**
   * Fields to search when no fields are specified in a search
   *
   * @param {String|*} fields
   * @returns {QueryOptions}
   *
   * @example options.fields('title^3', 'description')
   */
  fields(...fields) {
    if (!this._options.hasOwnProperty('fields')) {
      this._options['fields'] = [];
    }

    fields.forEach((field) => {
      this._options['fields'].push(field);
    });

    return this;
  }

  /**
   * @returns {Item[]}
   */
  options() {
    return this._options;
  }

  /**
   * @returns {String}
   */
  export() {
    return JSON.stringify(this._options);
  }
}
