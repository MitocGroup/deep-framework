/**
 * Created by mgoria on 1/29/16.
 */

'use strict';

import {LogDriverException} from './LogDriverException';

/**
 * Thrown when RUM event is invalid
 */
export class RumEventValidationException extends LogDriverException {
  /**
   * @param {String} eventLevel
   * @param {Object} error
   */
  constructor(eventLevel, error) {
    super(`Failed to validate "${eventLevel}" event: ${error}`);
  }
}
