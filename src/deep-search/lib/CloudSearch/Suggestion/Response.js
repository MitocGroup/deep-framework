/**
 * Created by AlexanderC on 1/12/16.
 */

'use strict';

import {Item} from './Item';
import {Response as BaseResponse} from '../Response';

export class Response extends BaseResponse {
  /**
   * @param {Error|null} error
   * @param {Object} data
   */
  constructor(error, data) {
    super(error, data);

    this._totalMatched = null;
    this._suggestions = [];

    if (data) {
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
}
