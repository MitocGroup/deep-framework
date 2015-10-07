/**
 * Created by AlexanderC on 8/21/15.
 */

'use strict';

import {Exception} from '../../Exception/Exception';

export class CachedRequestException extends Exception {
  /**
   * @param {String} exception
   */
  constructor(exception) {
    super(`Error while working with cached response: ${exception}`);
  }
}
