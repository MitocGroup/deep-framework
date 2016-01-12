/**
 * Created by AlexanderC on 1/12/16.
 */

'use strict';

/**
 * Single value, sort enabled numeric fields (int, double, date). (You must specify a specific field, wildcards are not supported.)
 * Other expressions
 * The _score variable, which references a document's relevance score
 * The _time variable, which references the current epoch time
 * The _rand variable, which returns a randomly generated value
 * Integer, floating point, hex, and octal literals
 * Arithmetic operators: + - * / %
 * Bitwise operators: | & ^ ~ << >> >>>
 * Boolean operators (including the ternary operator): && || ! ?:
 * Comparison operators: < <= == >= >
 * Mathematical functions: abs ceil exp floor ln log10 logn max min pow sqrt pow
 * Trigonometric functions: acos acosh asin asinh atan atan2 atanh cos cosh sin sinh tanh tan
 * The haversin distance function
 *
 * @example (0.3*popularity)+(0.7*_score)
 *          _score/(_time - release_date)
 */
export class Item {
  /**
   * @param {String} value
   * @param {String} name
   */
  constructor(value = null, name = null) {
    this._name = name;
    this._value = value;
  }

  /**
   * @returns {Boolean}
   */
  get isNamed() {
    return !!this._name;
  }

  /**
   * @returns {String}
   */
  get name() {
    return this._name;
  }

  /**
   * @param {String} name
   */
  set name(name) {
    this._name = name;
  }

  /**
   * @returns {String}
   */
  get value() {
    return this._value;
  }

  /**
   * @param {String} value
   */
  set value(value) {
    this._value = value;
  }

  /**
   * Relevance score
   *
   * @returns {String}
   */
  static get SCORE() {
    return '_score';
  }

  /**
   * Current epoch time
   *
   * @returns {String}
   */
  static get NOW() {
    return '_time';
  }

  /**
   * Random value
   *
   * @returns {String}
   */
  static get RANDOM() {
    return '_rand';
  }
}
