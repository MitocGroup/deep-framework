/**
 * Created by AlexanderC on 6/15/15.
 */

'use strict';

import {Exception} from './Exception';

export class ValidationSchemaNotFoundException extends Exception {
  /**
   * @param {String} schemaName
   */
  constructor(schemaName) {
    super(`Missing validation schema '${schemaName}'`);
  }
}
