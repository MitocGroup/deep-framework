/**
 * Created by AlexanderC on 6/20/15.
 */

'use strict';

import {Exception} from './Exception';

export class InvalidJoiSchemaException extends Exception {
  /**
   * @param {String} schemaName
   */
  constructor(schemaName) {
    super(`Invalid validation schema ${schemaName}. Object must be a Joi instance!`);
  }
}
