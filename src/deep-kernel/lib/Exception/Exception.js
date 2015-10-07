/**
 * Created by AlexanderC on 6/10/15.
 */

'use strict';

import Core from 'deep-core';

/**
 * Thrown when any kernel exception occurs
 */
export class Exception extends Core.Exception.Exception {
  /**
   * @param {Array} args
   */
  constructor(...args) {
    super(...args);
  }
}
