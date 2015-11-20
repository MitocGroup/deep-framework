/**
 * Created by mgoria on 11/10/15.
 */

'use strict';

import {Exception} from './Exception';

/**
 * Thrown when failed to sync a CognitoSync dataset
 */
export class SynchronizeCognitoDatasetException extends Exception {
  /**
   * @param {String} dataset
   * @param {Object} error
   */
  constructor(dataset, error) {
    super(`Error on synchronizing "${dataset}" Cognito dataset. ${error}`);
  }
}
