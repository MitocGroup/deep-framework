/**
 * Created by AlexanderC on 9/23/15.
 */

'use strict';

import {Exception} from './Exception';

export class ServerAlreadyRunningException extends Exception {
  /**
   * @param {Object} driver
   */
  constructor(driver) {
    super(`The DB server ${driver.constructor.name} on port ${driver.port} is already running`);
  }
}
