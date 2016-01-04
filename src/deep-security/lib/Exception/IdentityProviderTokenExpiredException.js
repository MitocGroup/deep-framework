/**
 * Created by mgoria on 12/22/15.
 */

'use strict';

import {Exception} from './Exception';

/**
 * Thrown when identity provider token expired
 */
export class IdentityProviderTokenExpiredException extends Exception {
  /**
   * @param {String} providerName
   * @param {Date} expireTime
   */
  constructor(providerName, expireTime) {
    super(`"${providerName}" access_token has expired on "${expireTime.toString()}".`);
  }
}
