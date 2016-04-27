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

    this._identityPoolId = 'us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xx0123456789';
  }

  /**
   * @param {Function} callback
   */
  loadCredentials(callback = () => {}) {
    // fake local credentials
    this._credentials = {
      // use provider user id or a fake userId instead of cognito identity id for local backend
      identityId: this.identityProvider ? this.identityProvider.userId : 'us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
    };

    callback(null, this._credentials);
  }

  /**
   * 'Reset' credentials
   */
  destroy() {
    this._credentials = null;
    this._credsManager = null;
  }
}
