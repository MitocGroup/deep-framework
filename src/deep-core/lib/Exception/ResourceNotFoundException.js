/**
 * Created by mgoria on 7/28/16.
 */

'use strict';

import {Exception} from './Exception';

/**
 * Thrown when resource not found
 */
export class ResourceNotFoundException extends Exception {
  /**
   * @param {String|Number|null} resourceName
   */
  constructor(resourceName = null) {
    let message = resourceName ?
      `Resource "${resourceName}" was not found.` :
      'Resource not found.';

    super(message, 404);
  }
}
