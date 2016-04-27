/**
 * Created by mgoria on 27/04/15.
 */

'use strict';

import {IdentityProvider} from './IdentityProvider';

export class LocalIdentityProvider extends IdentityProvider {
  /**
   * @param providerName
   * @param providers
   * @returns {*}
   */
  getProviderDomain(providerName, providers) {
    return super.getProviderDomain(providerName, providers) || providerName;
  }
}
