/**
 * Created by AlexanderC on 6/15/15.
 */

'use strict';

import {AbstractDriver} from './AbstractDriver';

/**
 * Console native logging
 */
export class ConsoleDriver extends AbstractDriver {
  constructor() {
    super();
  }

  /**
   * @param {String} msg
   * @param {String} level
   * @param {*} context
   */
  log(msg, level, context) {
    var datetime = AbstractDriver.datetime;

    console.log(`${level.toUpperCase()} on ${datetime}: `, msg, context);
  }
}
