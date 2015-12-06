/**
 * Created by mgoria on 6/23/15.
 */

'use strict';

import AWS from 'aws-sdk';
import {AuthException} from './Exception/AuthException';
import {DescribeIdentityException} from './Exception/DescribeIdentityException';
import {CredentialsManager} from './CredentialsManager';

/**
 * Security token holds details about logged user
 */
export class Token {
  /**
   * @param {String} identityPoolId
   */
  constructor(identityPoolId) {
    this._identityPoolId = identityPoolId;

    this._identityProvider = null;
    this._lambdaContext = null;
    this._user = null;
    this._userProvider = null;
    this._credentials = null;
    this._identityMetadata = null;

    this._credsManager = new CredentialsManager(identityPoolId);

    this._setupAwsCognitoConfig();
  }

  /**
   * Setup region for CognitoIdentity and CognitoSync services
   *
   * @private
   */
  _setupAwsCognitoConfig() {
    // @todo: set retries in a smarter way...
    AWS.config.maxRetries = 3;

    let cognitoRegion = Token.getRegionFromIdentityPoolId(this._identityPoolId);

    AWS.config.update({
      cognitoidentity: {region: cognitoRegion},
      cognitosync: {region: cognitoRegion},
    });
  }

  /**
   * @returns {IdentityProvider}
   */
  get identityProvider() {
    return this._identityProvider;
  }

  /**
   * @param {IdentityProvider} provider
   */
  set identityProvider(provider) {
    this._identityProvider = provider;
  }

  /**
   * @returns {Object}
   */
  get lambdaContext() {
    return this._lambdaContext;
  }

  /**
   * @param {Object} lambdaContext
   */
  set lambdaContext(lambdaContext) {
    this._lambdaContext = lambdaContext;
  }

  /**
   * @param {Function} callback
   */
  loadCredentials(callback = () => {}) {
    // avoid refreshing or loading credentials for each request
    if (this._validCredentials()) {
      callback(null, this.credentials);
      return;
    }

    if (this.lambdaContext) {
      this._credsManager.loadCredentials(this.identityId, (error, credentials) => {
        if (error) {
          callback(error, null);
          return;
        }

        this._credentials = credentials;

        callback(null, this._credentials);
      });
    } else {
      let cognitoParams = {
        IdentityPoolId: this._identityPoolId,
      };

      if (this.identityProvider) {
        cognitoParams.Logins = {};
        cognitoParams.Logins[this.identityProvider.name] = this.identityProvider.userToken;
      }

      this._credentials = new AWS.CognitoIdentityCredentials(cognitoParams);

      this._credentials.refresh((error) => {
        if (error) {
          callback(new AuthException(error), null);
          return;
        }

        AWS.config.credentials = this._credentials;

        this._credsManager.saveCredentials(this._credentials, (error, record) => {
          if (error) {
            callback(error, null);
            return;
          }

          callback(null, this._credentials);
        });
      });
    }
  }

  /**
   * @param {String} identityPoolId
   * @returns {String}
   */
  static getRegionFromIdentityPoolId(identityPoolId) {
    return identityPoolId.split(':')[0];
  }

  /**
   * @returns {String}
   */
  get identityId() {
    let identityId = null;

    if (this.credentials && this.credentials.hasOwnProperty('identityId')) {
      identityId = this.credentials.identityId;
    } else if (this.lambdaContext) {
      identityId = this.lambdaContext.identity.cognitoIdentityId;
    }

    return identityId;
  }

  /**
   * @returns {Object}
   */
  get credentials() {
    return this._credentials;
  }

  /**
   * @returns {boolean}
   * @private
   */
  _validCredentials() {
    return this.credentials && this.expireDateTime > new Date();
  }

  /**
   * @returns {Date}
   */
  get expireDateTime() {
    let dateTime = null;

    if (this.credentials.hasOwnProperty('expireTime')) {
      dateTime = this.credentials.expireTime instanceof Date ?
        this.credentials.expireTime :
        new Date(this.credentials.expireTime);
    }

    return dateTime;
  }

  /**
   * @returns {Boolean}
   */
  get isAnonymous() {
    return (!this.identityProvider && !this.lambdaContext) || this._identityLogins.length <= 0;
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
    this._describeIdentity(this.identityId, () => {
      if (this.isAnonymous) {
        callback(null);
        return;
      }

      if (!this._user) {
        this._userProvider.loadUserByIdentityId(this.identityId, (user) => {
          this._user = user;

          callback(this._user);
        });

        return;
      }

      callback(this._user);
    });
  }

  /**
   * @param {String} identityPoolId
   */
  static create(identityPoolId) {
    return new this(identityPoolId);
  }

  /**
   * @param {String} identityPoolId
   * @param {IdentityProvider} identityProvider
   */
  static createFromIdentityProvider(identityPoolId, identityProvider) {
    let token = new this(identityPoolId);
    token.identityProvider = identityProvider;

    return token;
  }

  /**
   * @param {String} identityPoolId
   * @param {Object} lambdaContext
   */
  static createFromLambdaContext(identityPoolId, lambdaContext) {
    let token = new this(identityPoolId);
    token.lambdaContext = lambdaContext;

    return token;
  }

  /**
   * @param {String} identityId
   * @param {Function} callback
   * @private
   */
  _describeIdentity(identityId, callback) {
    if (this._identityMetadata) {
      callback(this._identityMetadata);
      return;
    }

    let cognitoIdentity = new AWS.CognitoIdentity();

    cognitoIdentity.describeIdentity({IdentityId: identityId}, (error, data) => {
      if (error) {
        throw new DescribeIdentityException(identityId, error);
      }

      this._identityMetadata = data;

      callback(this._identityMetadata);
    });
  }

  /**
   * @returns {Array}
   * @private
   */
  get _identityLogins() {
    return this._identityMetadata && this._identityMetadata.hasOwnProperty('Logins') ?
      this._identityMetadata.Logins :
      [];
  }
}
