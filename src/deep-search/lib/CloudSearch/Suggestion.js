/**
 * Created by AlexanderC on 1/12/16.
 */

'use strict';

import {Response} from './Suggestion/Response';

export class Suggestion {
  /**
   * @param {AWS.CloudSearchDomain} cloudSearchDomain
   * @param {String} field
   */
  constructor(cloudSearchDomain, field) {
    this._cloudSearchDomain = cloudSearchDomain;
    this._field = field;
    this._size = Suggestion.DEFAULT_SIZE;
  }

  /**
   * @param {String} str
   * @param {Function} callback
   * @returns {Suggestion}
   */
  suggest(str, callback) {
    this._cloudSearchDomain.suggest({
      query: str.toString(),
      suggester: this._field,
      size: this._size,
    }, (error, data) => {
      callback(new Response(error, data));
    });

    return this;
  }

  /**
   * @param {Number} size
   * @returns {Suggestion}
   */
  size(size) {
    this._size = Math.abs(parseInt(size));

    return this;
  }

  /**
   * @returns {String}
   */
  get field() {
    return this._field;
  }

  /**
   * @returns {Number}
   */
  static get DEFAULT_SIZE() {
    return 10;
  }
}
