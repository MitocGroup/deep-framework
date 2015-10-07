/**
 * Created by Stefan Hariton on 6/26/15.
 */

'use strict';

import {Exception} from './Exception';

/**
 * Thrown when undefined method is requested
 */
export class UndefinedMethodException extends Exception {
  /**
   * @param name
   * @param availableMethods
   */
  constructor(name, availableMethods) {
    super(`Method: ${name} does not exist. Available methods:${availableMethods}).`);
  }
}
