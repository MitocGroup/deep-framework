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
   * @param {Array} args
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
      expireTime: Date.now() + 86400000,
      // use provider user id or a fake userId instead of cognito identity id for local backend
      identityId: this.identityProvider ?
        this.identityProvider.userId :
        'us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
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
    // @todo: backward compatibility hook, remove on next major release
    let argsHandler = (error, user) => {
      if (callback.length === 1) {
        if (error) {
          throw error;
        }

        return callback(user);
      }

      callback(error, user);
    };

    this._loadUser(argsHandler);
  }

  /**
   * 'Reset' credentials
   */
  destroy() {
    this._credentials = null;
    this._credsManager = null;
  }
}
