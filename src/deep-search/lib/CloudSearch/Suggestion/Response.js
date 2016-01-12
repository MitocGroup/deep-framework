/**
 * Created by AlexanderC on 1/12/16.
 */

'use strict';

import {Item} from './Item';

export class Response {
  /**
   * @param {Error|null} error
   * @param {Object} data
   */
  constructor(error, data) {
    this._error = error;
    this._executionTime = null;
    this._totalMatched = null;
    this._suggestions = [];


    if (data) {
      this._parseRawData(data);
    }
  }

  /**
   * @returns {Item[]}
   */
  get suggestions() {
    return this._suggestions;
  }

  /**
   * @returns {Number}
   */
  get totalMatched() {
    return this._totalMatched;
  }

  /**
   * @returns {Number}
   */
  get executionTime() {
    return this._executionTime;
  }

  /**
   * @returns {Error|null}
   */
  get error() {
    return this._error;
  }

  /**
   * @returns {Boolean}
   */
  get isError() {
    return !!this._error;
  }

  /**
   * @param {Object} data
   * @private
   */
  _parseRawData(data) {
    this._executionTime = data.status.timems;
    this._totalMatched = data.suggest.found;

    data.suggest.suggestions.forEach((rawSuggestion) => {
      this._suggestions.push(new Item(
        rawSuggestion.id,
        rawSuggestion.score,
        rawSuggestion.suggestion
      ));
    });
  }
}
