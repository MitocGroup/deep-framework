/**
 * Created by AlexanderC on 1/12/16.
 */

'use strict';

export class Item {
  /**
   * @param {String} id
   * @param {Number} score
   * @param {String} suggestion
   */
  constructor(id, score, suggestion) {
    this._id = id;
    this._score = score;
    this._suggestion = suggestion;
  }

  /**
   * @returns {String}
   */
  get id() {
    return this._id;
  }

  /**
   * @returns {Number}
   */
  get score() {
    return this._score;
  }

  /**
   * @returns {String}
   */
  get suggestion() {
    return this._suggestion;
  }
}
