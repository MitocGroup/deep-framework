/**
 * Created by CCristi on 4/4/17.
 */

'use strict';

import Core from 'deep-core';

export class AbstractImplementation extends Core.OOP.Interface {
  /**
   * @param {IdentityProvider} identityProvider
   */
  constructor(identityProvider) {
    super(['refreshIdentity']); // @todo: add other methods such as `normalizeMetadata`

    this._identityProvider = identityProvider;
  }

  /**
   * @returns {String}
   */
  get refreshToken() {
    return this._identityProvider.refreshToken;
  }

  /**
   * @returns {String}
   */
  get clientName() {
    return this._identityProvider.clientName;
  }

  /**
   * @returns {IdentityProvider|*}
   */
  get identityProvider() {
    return this._identityProvider;
  }
}
