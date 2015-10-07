/**
 * Created by mgoria on 6/23/15.
 */

'use strict';

import {Exception} from './Exception';

/**
 * Thrown when requested login provider is missing
 */
export class MissingLoginProviderException extends Exception {
  /**
   * @param {String} providerName
   */
  constructor(providerName) {
    super(`Missing login provider "${providerName}" in deep-security.`);
  }
}
