/**
 * Created by mgoria on 11/09/15.
 */

'use strict';

import {Exception} from './Exception';

/**
 * Thrown when put a new record to a CognitoSync dataset failed
 */
export class PutCognitoRecordException extends Exception {
  /**
   * @param {String} dataset
   * @param {String} record
   * @param {Object} error
   */
  constructor(dataset, record, error) {
    super(`Error on putting "${record}" record into "${dataset}" dataset. ${error}`);
  }
}
