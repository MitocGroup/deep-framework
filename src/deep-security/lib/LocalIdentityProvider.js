/**
 * Created by mgoria on 27/04/15.
 */

'use strict';

import {IdentityProvider} from './IdentityProvider';

export class LocalIdentityProvider extends IdentityProvider {

  /**
   * @param {Array} args
   */
  constructor(...args) {
    super(...args);
  }

  /**
   * @param {String} providerName
   * @param {Object} providers
   * @returns {*}
   */
  getProviderDomain(providerName, providers) {
    return super.getProviderDomain(providerName, providers) || providerName;
  }
}
