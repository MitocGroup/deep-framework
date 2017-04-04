/**
 * Created by CCristi on 11/21/16.
 */

'use strict';

import {TokenManager} from './TokenManager';
import AWS from 'aws-sdk';
import {IdentityProviderTokenExpiredException} from './Exception/IdentityProviderTokenExpiredException';
import {AuthException} from './Exception/AuthException';

export class CredentialsManager {
  /**
   * @param {Token} token
   */
  constructor(token) {
    this._token = token;
    this._systemCredentials = null;
    this._rolesCredentials = {};
  }

  /**
   * @returns {Token}
   */
  get token() {
    return this._token;
  }

  /**
   * @returns {Number}
   */
  get identityPoolId() {
    return this.token._identityPoolId;
  }

  /**
   * @returns {IdentityProvider}
   */
  get identityProvider() {
    return this.token.identityProvider;
  }

  /**
   * @returns {Array}
   */
  get rolesCredentials() {
    return this._rolesCredentials;
  }

  /**
   * @param {Array} rolesCredentials
   */
  set rolesCredentials(rolesCredentials) {
    this._rolesCredentials = rolesCredentials;
  }

  /**
   * @param {Object} credentials
   * @returns {boolean}
   */
  validCredentials(credentials) {
    return credentials && this.getCredentialsExpireDateTime(credentials) > new Date();
  }

  /**
   * @param {Object} credentials
   * @returns {Date}
   */
  getCredentialsExpireDateTime(credentials) {
    let dateTime = null;

    if (credentials && credentials.hasOwnProperty('expireTime')) {
      dateTime = credentials.expireTime instanceof Date ?
        credentials.expireTime :
        new Date(credentials.expireTime);
    }

    return dateTime;
  }

  /**
   * @param {Object|null} role
   * @param {Boolean} refreshOnExpired
   * @returns {Promise}
   */
  getCredentials(role = null, refreshOnExpired = true) {
    let credentials = role ? this._rolesCredentials[this.roleSessionKey(role)] : this._systemCredentials;
    credentials = credentials || this._createCognitoIdentityCredentials(role);

    if (!this.validCredentials(credentials) && refreshOnExpired) {
      return this.refreshIdentityProviderIfNeeded().then(() => {
        credentials = this._createCognitoIdentityCredentials(role);

        if (role) {
          this._rolesCredentials[this.roleSessionKey(role)] = credentials;
        } else {
          this.systemCredentials = credentials;
        }

        return this._refreshCredentials(credentials);
      });
    }

    return Promise.resolve(credentials);
  }

  /**
   * @returns {Promise}
   */
  refreshIdentityProviderIfNeeded() {
    return this.identityProvider && !this.identityProvider.isTokenValid()
      ? this.identityProvider.refresh()
      : Promise.resolve();
  }

  /**
   * @param {AWS.CognitoIdentityCredentials} credentials
   * @returns {Promise}
   * @private
   */
  _refreshCredentials(credentials) {
    if (!(credentials instanceof AWS.CognitoIdentityCredentials || credentials instanceof AWS.Credentials)) {
      let error = new AuthException(
        'Invalid credentials instance. Passed credentials must be an instance of AWS.CognitoIdentityCredentials.'
      );

      return Promise.reject(error);
    }

    if (this.identityProvider && !this.identityProvider.isTokenValid()) {
      let error = new IdentityProviderTokenExpiredException(
        this.identityProvider.name,
        this.identityProvider.tokenExpirationTime
      );

      return Promise.reject(error);
    }

    return new Promise(
      (resolve, reject) => {
        credentials.refresh((error) => {
          if (error) {
            return reject(new AuthException(error));
          }

          return resolve(credentials);
        });
      }
    );
  }

  /**
   * @param {Object|null} role
   * @returns {*}
   */
  roleSessionKey(role) {
    let suffix = role ? role.Id : 'default';

    return `${TokenManager.RECORD_NAME}-${suffix}`;
  }

  /**
   * @param {Object} role
   * @returns {AWS.CognitoIdentityCredentials|*}
   * @private
   */
  _createCognitoIdentityCredentials(role = null) {
    let cognitoParams = {
      IdentityPoolId: this.identityPoolId,
    };

    if (this.identityProvider) {
      cognitoParams.Logins = {};
      cognitoParams.Logins[this.identityProvider.name] = this.identityProvider.userToken;
      cognitoParams.LoginId = this.identityProvider.userId;

      if (role) {
        cognitoParams.RoleArn = role.IamRole.Arn;
        cognitoParams.RoleSessionName = this.roleSessionKey(role);
      }
    }

    let credentials = new AWS.CognitoIdentityCredentials(cognitoParams);

    // do not replace with arrow function, `this` context should not be overwritten
    credentials.toJSON = function () {
      return {
        expired: this.expired,
        expireTime: this.expireTime,
        accessKeyId: this.accessKeyId,
        secretAccessKey: this.secretAccessKey,
        sessionToken: this.sessionToken,
      };
    };

    return credentials;
  }

  /**
   * @returns {CredentialsManager}
   */
  clearCache() {
    if (!(this._systemCredentials instanceof AWS.CognitoIdentityCredentials)) {
      // cognitoSyncManager failes to wipe data if credentials are a instanceof AWS.Credentials
      this.systemCredentials = this._createCognitoIdentityCredentials();
    }

    this._systemCredentials.clearCachedId();

    for (let key in this._rolesCredentials) {
      if (this._rolesCredentials.hasOwnProperty(key) &&
        this._rolesCredentials[key] instanceof AWS.CognitoIdentityCredentials) {
        this._rolesCredentials[key].clearCachedId();
      }
    }

    return this;
  }

  /**
   * @param {AWS.CognitoIdentityCredentials|AWS.Credentials|*} systemCredentials
   */
  set systemCredentials(systemCredentials) {
    this._systemCredentials = systemCredentials;

    if (!this.token.lambdaContext) {
      this.overwriteAWSCredentials(systemCredentials);
    }
  }

  /**
   * @returns {AWS.CognitoIdentityCredentials|AWS.Credentials|*}
   */
  get systemCredentials() {
    return this._systemCredentials;
  }

  /**
   * @param {AWS.CognitoIdentityCredentials|AWS.Credentials|*} credentials
   * @returns {CredentialsManager}
   */
  overwriteAWSCredentials(credentials) {
    AWS.config.credentials = credentials;

    // tokenManager will create a new instance of CognitoSyncClient
    if (this._token) {
      this._token._sts.credentials = credentials;

      if (this._token._tokenManager) {
        this._token._tokenManager._cognitoSyncClient = null;
      }
    }

    return this;
  }
}
