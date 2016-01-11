/**
 * Created by mgoria on 12/22/15.
 */

'use strict';

import {Exception} from './Exception';

/**
 * Thrown when provider identity metadata does not contain required fields (access_token and token expiration time)
 */
export class InvalidProviderIdentityException extends Exception {
  /**
   * @param {String} providerName
   */
  constructor(providerName) {
    super(`Passed "${providerName}" identity does not contain mandatory access_token or tokenExpirationTime fields.`);
  }
}
