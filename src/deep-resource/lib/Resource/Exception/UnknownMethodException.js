/**
 * Created by AlexanderC on 6/10/15.
 */

'use strict';

import {Exception} from '../../Exception/Exception';

/**
 * Thrown when requested method is missing from allowed vector
 */
export class UnknownMethodException extends Exception {
  /**
   * @param {String} requestedMethod
   * @param {Array} availableMethods
   */
  constructor(requestedMethod, availableMethods) {
    let availableList = availableMethods.join(', ');

    super(`Requested method ${requestedMethod} must be one of ${availableList}`);
  }
}
