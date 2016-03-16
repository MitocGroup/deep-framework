/**
 * Created by mgoria on 12/03/15.
 */

'use strict';

import {Exception} from '../../Exception/Exception';

export class DirectCallNotAvailableException extends Exception {
  /**
   * @param {String} type
   */
  constructor(type) {
    super(`Direct calls are available for lambdas only (${type} type provided)`);
  }
}
