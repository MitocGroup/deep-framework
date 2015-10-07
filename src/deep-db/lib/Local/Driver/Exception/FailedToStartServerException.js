/**
 * Created by AlexanderC on 9/23/15.
 */

'use strict';

import {Exception} from './Exception';

export class FailedToStartServerException extends Exception {
  /**
   * @param {Object} driver
   * @param {String} error
   */
  constructor(driver, error) {
    super(`Failed to start DB server ${driver.constructor.name} on port ${driver.port}: ${error}`);
  }
}
