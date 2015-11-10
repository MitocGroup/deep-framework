/**
 * Created by mgoria on 11/09/15.
 */

'use strict';

import {Exception} from './Exception';

/**
 * Thrown when open or create a CognitoSync dataset
 */
export class CreateCognitoDatasetException extends Exception {
  /**
   * @param {String} dataset
   * @param {Object} error
   */
  constructor(dataset, error) {
    super(`Error on opening or creating "${dataset}" Cognito dataset. ${error}`);
  }
}
