/**
 * Created by mgoria on 6/25/15.
 */

'use strict';

import {Exception} from './Exception';

export class FailedToCreateTablesException extends Exception {
  /**
   * @param {Array} tablesNames
   * @param {String} error
   */
  constructor(tablesNames, error) {
    super(`Failed to create ${tablesNames} tables. ${error}`);
  }
}
