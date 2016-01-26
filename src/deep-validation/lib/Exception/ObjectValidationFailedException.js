/**
 * Created by AlexanderC on 6/22/15.
 */

'use strict';

import {Exception} from './Exception';

/**
 * Thrown when object validation fails on a joi schema/model
 */
export class ObjectValidationFailedException extends Exception {
  /**
   * @param {String} schemaName
   * @param {String} error
   */
  constructor(schemaName, error) {
    super(`Object validation failed on schema ${schemaName}: ${error}`);

    this._originalError = error;
  }

  /**
   * @returns {Error}
   */
  get originalError() {
    return this._originalError;
  }
}
