/**
 * Created by mgoria on 1/19/16.
 */

'use strict';

import {AbstractDriver} from './AbstractDriver';

/**
 * SQS logging driver
 */
export class RumSqsDriver extends AbstractDriver {
  /**
   * @param {Array} args
   */
  constructor(...args) {
    super(...args);
  }

  /**
   * @param {Object} event
   */
  log(event) {
    // @todo - validate event object

    // @todo - push message to SQS
  }
}
