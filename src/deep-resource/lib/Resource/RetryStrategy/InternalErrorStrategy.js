
/**
 * Created by CCristi on 11/14/16.
 */

'use strict';

import {AbstractStrategy} from './AbstractStrategy';

export class InternalErrorStrategy extends AbstractStrategy {
  constructor() {
    super();
  }

  /**
   * @returns {Boolean}
   */
  onResult() {
    return false;
  }

  /**
   * @param {Response} response
   * @returns {Boolean}
   */
  onError(response) {
    return response.statusCode >= 500;
  }
}
