/**
 * Created by mgoria on 8/04/15.
 */

'use strict';

import {Exception} from '../../Exception/Exception';

/**
 * Thrown when requested resource action not found
 */
export class MissingActionException extends Exception {
  /**
   * @param {String} resourceName
   * @param {String} actionName
   */
  constructor(resourceName, actionName) {
    super(`Missing action ${actionName} in ${resourceName} resource.`);
  }
}
