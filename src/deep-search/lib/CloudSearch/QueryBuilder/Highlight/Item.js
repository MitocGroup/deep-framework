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
   * @param {String} str
   * @returns {Item}
   */
  postTag(str) {
    this._options['post_tag'] = str;

    return this;
  }

  /**
   * @param {String} str
   * @returns {Item}
   */
  preTag(str) {
    this._options['pre_tag'] = str;

    return this;
  }

  /**
   * Maximum number of occurrences of the search term(s) you want to highlight
   *
   * @param {Number} num
   * @returns {Item}
   */
  maxOccurrences(num) {
    this._options['max_phrases'] = Math.abs(parseInt(num));

    return this;
  }

  /**
   * @returns {Item}
   */
  plain() {
    return this.format(Item.TEXT);
  }

  /**
   * @param {String} format
   * @returns {Item}
   */
  format(format) {
    format = format.toLowerCase();

    if (format !== Item.TEXT && format !== Item.HTML) {
      throw new Error(`Highlight format have to be both ${Item.TEXT} or ${Item.HTML}`);
    }

    this._options['format'] = format;

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

  /**
   * @returns {String}
   */
  static get TEXT() {
    return 'text';
  }

  /**
   * @returns {String}
   */
  static get HTML() {
    return 'html';
  }
}