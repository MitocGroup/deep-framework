/**
 * Created by mgoria on 12/22/15.
 */

'use strict';

import {Exception} from './Exception';

/**
 * Thrown when passed identity provider name does not match provider name from identityMetadata
 */
export class IdentityProviderMismatchException extends Exception {
  /**
   * @param {String} providerName
   * @param {String} identityMetadataProvider
   */
  constructor(providerName, identityMetadataProvider) {
    super(`Provider "${providerName}" does not match with identityMetadataProvider "${identityMetadataProvider}".`);
  }
}
