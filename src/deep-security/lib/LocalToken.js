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
      // use provider user id or a fake userId instead of cognito identity id for local backend
      identityId: this.identityProvider ? this.identityProvider.userId : 'us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
    };

    callback(null, this._credentials);
  }

  /**
   * @returns {Boolean}
   */
  get isAnonymous() {
    if (this.lambdaContext) {
      return this.lambdaContext.identity.isAnonymous;
    } else {
      return !this.identityProvider;
    }
  }

  /**
   * @param {Function} callback
   */
  getUser(callback) {
    this._loadUser(callback);
  }

  /**
   * 'Reset' credentials
   */
  destroy() {
    this._credentials = null;
    this._credsManager = null;
  }
}
