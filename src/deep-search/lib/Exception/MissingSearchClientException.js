/**
 * Created by mgoria on 3/7/16.
 */

'use strict';

import {Exception} from './Exception';

/**
 * Thrown when any exception occurs
 */
export class MissingSearchClientException extends Exception {
  /**
   * @param {String} domainUrl
   */
  constructor(domainUrl) {
    super(`Error on creating client for "${domainUrl}" domain. Client implementation is missing.`);
  }
}