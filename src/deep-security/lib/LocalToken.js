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
    // use provider user id instead of cognito identity id for local backend
    this._identityId = this.identityProvider ? this.identityProvider.userId : null;

    callback(null, this);
  }
}
