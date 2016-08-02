/**
 * Created by AlexanderC on 6/10/15.
 */

/*eslint max-len: 0*/

'use strict';

import {Exception} from './Exception';

/**
 * Thrown when trying to parse an invalid deep identifier
 */
export class InvalidDeepIdentifierException extends Exception {
  /**
   * @param {String} identifier
   */
  constructor(identifier) {
    super(`Invalid deep identifier "${identifier}". It should conform to the following format: @microservice_identifier:resource_identifier.`);
  }
}
