/**
 * Created by AlexanderC on 6/25/15.
 */

'use strict';

import {Exception} from './Exception';

export class FailedToCreateTableException extends Exception {
  /**
   * @param {String} tableName
   */
  constructor(tableName) {
    super(`Failed to create table for model ${tableName}`);
  }
}
