/**
 * Created by AlexanderC on 5/25/15.
 */

'use strict';

import {Exception} from './Exception';
import {InvalidArgumentException} from './InvalidArgumentException';

/**
 * Thrown when methods from interface or abstract class are not implemented
 */
export class MethodsNotImplementedException extends Exception {
  /**
   * @param {Array} methods
   */
  constructor(methods) {
    if (!Array.isArray(methods)) {
      throw new InvalidArgumentException(methods, 'Array');
    }

    let methodPlain = methods.join(', ');

    super(`One or more method are not implemented (${methodPlain}).`);
  }
}
