/**
 * Created by AlexanderC on 6/20/15.
 */

'use strict';

import {Exception} from './Exception';

/**
 * Thrown when DB model validation schema is missing or broken
 */
export class InvalidSchemaException extends Exception {
  /**
   * @param {Object} model
   * @param {String} errorString
   */
  constructor(model, errorString) {
    super(`deep-db model ${JSON.stringify(model)} validation schema fails: ${errorString}`);
  }
}
