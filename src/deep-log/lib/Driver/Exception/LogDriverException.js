/**
 * Created by mgoria on 1/20/16.
 */

'use strict';

import {Exception} from '../../Exception/Exception';

/**
 * Base exception
 */
export class LogDriverException extends Exception {
  /**
   * @param {Array} args
   */
  constructor(...args) {
    super(...args);
  }
}
