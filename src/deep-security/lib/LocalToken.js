/**
 * Created by mgoria on 09/01/15.
 */

'use strict';

import {Token} from './Token';

/**
 * Security token holds details about logged user
 */
export class LocalToken extends Token {
  /**
   * @param args
   */
  constructor(...args) {
    super(...args);
  }

  /**
   * @param {Function} callback
   */
  loadCredentials(callback = () => {}) {
    // fake local credentials
    this._credentials = {
      // use provider user id or identityPoolId  instead of cognito identity id for local backend
      identityId: this.identityProvider ? this.identityProvider.userId : this._identityPoolId
    };

    callback(null, this);
  }

  /**
   * 'Reset' credentials
   */
  destroy() {
    this._credentials = null;
    this._credsManager = null;
  }
}
