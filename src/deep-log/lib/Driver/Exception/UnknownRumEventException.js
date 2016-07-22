/**
 * Created by mgoria on 02/01/16.
 */

'use strict';

import {LogDriverException} from './LogDriverException';

/**
 * Thrown when failed to 'guess' RUM event 'type'
 */
export class UnknownRumEventException extends LogDriverException {
  /**
   * @param {Object} event
   */
  constructor(event) {
    super(`Failed to 'guess' event type for ${JSON.stringify(event)} event.`);
  }
}
