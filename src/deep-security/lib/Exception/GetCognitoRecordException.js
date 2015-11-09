/**
 * Created by mgoria on 11/09/15.
 */

'use strict';

import {Exception} from './Exception';

/**
 * Thrown when getting a record from a CognitoSync dataset failed
 */
export class GetCognitoRecordException extends Exception {
  /**
   * @param {String} dataset
   * @param {String} record
   * @param {Object} error
   */
  constructor(dataset, record, error) {
    super(`Error on getting "${record}" record from "${dataset}" dataset. ${error}`);
  }
}
