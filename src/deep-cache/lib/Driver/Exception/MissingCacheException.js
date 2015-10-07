/**
 * Created by AlexanderC on 6/16/15.
 */

'use strict';

import {Exception} from './Exception';

/**
 * Thrown when missing an item from cache
 */
export class MissingCacheException extends Exception {
  /**
   * @param {String} cacheKey
   */
  constructor(cacheKey) {
    super(`Missing key ${cacheKey} from cache`);
  }
}
