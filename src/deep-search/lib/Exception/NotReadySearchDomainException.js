/**
 * Created by mgoria on 3/17/16.
 */

'use strict';

import {Exception} from './Exception';

/**
 * Thrown when any exception occurs
 */
export class NotReadySearchDomainException extends Exception {
  /**
   * @param {String} domainName
   * @param {String} domainType
   */
  constructor(domainName, domainType) {
    super(
      `"${domainType}" domain "${domainName}" is not yet ready.`
    );
  }
}
