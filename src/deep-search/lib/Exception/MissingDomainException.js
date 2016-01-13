/**
 * Created by AlexanderC on 1/13/16.
 */

'use strict';

import {Exception} from './Exception';

export class MissingDomainException extends Exception {
  /**
   * @param {String} domain
   */
  constructor(domain) {
    super(`Missing CloudSearch domain for ${name}`);
  }
}