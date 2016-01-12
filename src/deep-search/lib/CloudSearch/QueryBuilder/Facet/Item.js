/**
 * Created by AlexanderC on 1/12/16.
 */

'use strict';

export class Item {
  /**
   * @param {String} field
   */
  constructor(field) {
    this._field = field;
    this._options = {};
  }

  /**
   * @returns {String}
   */
  get field() {
    return this._field;
  }

  /**
   * @param {String} value
   * @returns {Item}
   */
  addBucket(value) {
    if (!this._options.hasOwnProperty('buckets')) {
      this._options['buckets'] = [];
    }

    this._options['buckets'].push(value.toString());

    return this;
  }

  /**
   * @param {String|*} values
   * @returns {Item}
   */
  buckets(...values) {
    this._options['buckets'] = values.map((x) => x.toString());

    return this;
  }

  /**
   * @param {Number} size
   * @returns {Item}
   */
  top(size) {
    this._options['size'] = Math.abs(parseInt(size));

    return this;
  }

  /**
   * @returns {Item}
   */
  sortByCount() {
    this._options['sort'] = 'count';

    return this;
  }

  /**
   * @returns {Item}
   */
  sortByValue() {
    this._options['sort'] = 'bucket';

    return this;
  }

  /**
   * @param {String} name
   * @param {*} value
   * @returns {Item}
   */
  option(name, value) {
    this._options[name] = value;

    return this;
  }

  /**
   * @returns {Object}
   */
  get options() {
    return this._options;
  }
}