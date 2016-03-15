'use strict';

import {Exception} from './Exception';

/**
 * Thrown when operation on the database failed
 */
export class DatabaseOperationException extends Exception {

  /**
   * @param {String} error
   */
  constructor(error) {
    super(`Database operation failed. ${error}`, 500);
  }
}
