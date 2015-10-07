/**
 * Created by AlexanderC on 9/23/15.
 */

'use strict';

import {Exception} from './Exception';

export class ServerTtsExceededException extends Exception {
  /**
   * @param {Object} driver
   * @param {Number} tts
   */
  constructor(driver, tts) {
    super(`The DB server's ${driver.constructor.name} tts of ${tts} seconds exceeded`);
  }
}
