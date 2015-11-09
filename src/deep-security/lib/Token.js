/**
 * Created by mgoria on 6/23/15.
 */

'use strict';

import AWS from 'aws-sdk';
import {AuthException} from './Exception/AuthException';
import {CredentialsManager} from './CredentialsManager';

/**
 * Security token holds details about logged user
 */
export class Token {
  /**
   * @param {String} identityPoolId
   * @param {String} providerName
   * @param {String} providerUserToken
   * @param {String} providerUserId
   */
  constructor(identityPoolId, providerName = null, providerUserToken = null, providerUserId = null) {
    this._identityPoolId = identityPoolId;
    this._providerName = providerName;
    this._providerUserToken = providerUserToken;
    this._providerUserId = providerUserId;

    this._user = null;
    this._userProvider = null;
    this._identityId = null;
    this._credentials = null;

    this._isAnonymous = true;
    this._credsManager = new CredentialsManager();
  }

  /**
   * @param {Boolean} updateAwsCreds
   * @param {Function} callback
   */
  loadCredentials(updateAwsCreds = true, callback = () => null) {
    // @todo: set retries in a smarter way...
    AWS.config.maxRetries = 3;

    let defaultRegion = AWS.config.region;

    AWS.config.update({
      region: Token._getRegionFromIdentityPoolId(this._identityPoolId),
    });

    let cognitoParams = {
      IdentityPoolId: this._identityPoolId,
    };

    if (this._providerName && this._providerUserToken) {
      this._isAnonymous = false;
      cognitoParams.Logins = {};
      cognitoParams.Logins[this._providerName] = this._providerUserToken;
    }

    this._credentials = new AWS.CognitoIdentityCredentials(cognitoParams);

    this._credentials.refresh((error) => {
      if (error) {
        callback(new AuthException(error));
        return;
      }

      this._identityId = this._credentials.identityId;

      // update AWS credentials
      if (updateAwsCreds) {
        AWS.config.credentials = this._credentials;
        AWS.config.update({
          accessKeyId: this._credentials.accessKeyId,
          secretAccessKey: this._credentials.secretAccessKey,
          sessionToken: this._credentials.sessionToken,
          region: defaultRegion, // restore to default region
        });
      }

      this._credsManager.loadCredentials(this._credentials, (record) => {
        console.log('Creds record - ', record);

        callback(null, this);
      });
    });
  }

  /**
   * @param {String} identityPoolId
   * @returns {String}
   * @private
   */
  static _getRegionFromIdentityPoolId(identityPoolId) {
    return identityPoolId.split(':')[0];
  }

  /**
   * @returns {String}
   */
  get providerName() {
    return this._providerName;
  }

  /**
   * @returns {String}
   */
  get providerUserToken() {
    return this._providerUserToken;
  }

  /**
   * @returns {String}
   */
  get providerUserId() {
    return this._providerUserId;
  }

  /**
   * @returns {String}
   */
  get identityId() {
    return this._identityId;
  }

  /**
   * @returns {Object}
   */
  get credentials() {
    return this._credentials;
  }

  /**
   * @returns {Boolean}
   */
  get isAnonymous() {
    return this._isAnonymous;
  }

  /**
   * @param {UserProvider} userProvider
   */
  set userProvider(userProvider) {
    this._userProvider = userProvider;
  }

  /**
   * @param {Function} callback
   */
  getUser(callback) {
    if (this.isAnonymous) {
      callback(null);
      return;
    }

    if (!this._user) {
      this._userProvider.loadUserByIdentityId(this.identityId, (user) => {
        if (user) {
          this._user = user;
        }

        callback(user);
      });

      return;
    }

    callback(this._user);
  }
}
