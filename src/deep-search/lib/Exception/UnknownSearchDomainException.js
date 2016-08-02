/**
 * Created by mgoria on 3/4/16.
 */

'use strict';

import {Exception} from './Exception';

/**
 * Thrown when any exception occurs
 */
export class UnknownSearchDomainException extends Exception {
  /**
   * @param {String} domainName
   * @param {Array} domains
   */
  constructor(domainName, domains) {
    super(`Unknown search domain "${domainName}". Defined domains are "${domains.join(', ')}"`);
  }
}
