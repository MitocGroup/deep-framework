/**
 * Created by mgoria on 03/04/15.
 */

'use strict';

import Core from 'deep-core';

/**
 * Thrown when any exception occurs
 */
export class Exception extends Core.Exception.Exception {
  /**
   * @param {Array} args
   */
  constructor(...args) {
    super(...args);
  }
}
