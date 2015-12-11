/**
 * Created by CCristi <ccovali@mitocgroup.com> on 12/10/15.
 */

'use strict';

import {Exception} from './Exception';

/**
 * Thrown when a method is not available
 */
export class MethodNotAvailableException {
  /**
   * @param {String} name
   */
  constructor(name) {
    super(`Method '${methodName}' is not available`);
  }
}
