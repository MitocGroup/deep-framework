/**
 * Created by AlexanderC on 3/2/16.
 */

'use strict';

import {Exception} from '../../Exception/Exception';

export class SourceNotAvailableException extends Exception {
  /**
   * @param {String} type
   * @param {Action|*} action
   */
  constructor(type, action) {
    super(`The ${type} source is not available for the resource '${action.fullName}'`);
  }
}
