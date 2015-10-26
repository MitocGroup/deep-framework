/**
 * Created by AlexanderC on 6/10/15.
 */

'use strict';

import {Exception} from './Exception';

/**
 * Thrown when trying to parse an invalid deep identifier
 */
export class InvalidDeepIdentifierException extends Exception {
  /**
   * @param {String} identifier
   * @param {RegExp} regExp
   */
  constructor(identifier, regExp) {
    super(`Invalid deep identifier "${identifier}". It should pass "${regExp.toString()}" regExp.`);
  }
}
