/**
 * Created by mgoria on 10/31/15.
 */

'use strict';

import {Exception} from '../../../Exception/Exception';

/**
 * Thrown when context identity pool id does not much identity pool id from security service
 */
export class InvalidCognitoIdentityException extends Exception {
  /**
   * @param {String} identityPoolId
   */
  constructor(identityPoolId) {
    super(`Invalid cognito identity pool "${identityPoolId}".`);
  }
}
