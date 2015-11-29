/**
 * Created by mgoria on 11/03/15.
 */

'use strict';

import {Exception} from '../../Exception/Exception';

export class AsyncCallNotAvailableException extends Exception {
  /**
   * @param {String} type
   */
  constructor(type) {
    super(`Async calls are available for lambdas only (${type} type provided)`);
  }
}
