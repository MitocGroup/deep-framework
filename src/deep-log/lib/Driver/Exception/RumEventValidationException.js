/**
 * Created by mgoria on 1/29/16.
 */

'use strict';

import {LogDriverException} from './LogDriverException';

/**
 * Thrown when SQS queue url is invalid
 */
export class RumEventValidationException extends LogDriverException {
  /**
   * @param {String} schemaName
   * @param {String} error
   */
  constructor(schemaName, error) {
    super(`Rum event validation failed on schema ${schemaName}: ${error}`);
  }
}