/**
 * Created by mgoria on 6/23/15.
 */

'use strict';

import AWS from 'aws-sdk';
import {AuthException} from './Exception/AuthException';
import {IdentityProviderTokenExpiredException} from './Exception/IdentityProviderTokenExpiredException';
import {DescribeIdentityException} from './Exception/DescribeIdentityException';
import {CredentialsManager} from './CredentialsManager';
import {Exception} from './Exception/Exception';
import {Exception as CoreException} from 'deep-core';
import {Security} from './Security';
import util from 'util';

/**
 * Security token holds details about logged user
 */
export class Token {
  /**
   * @param {String} identityPoolId
   */
  constructor(identityPoolId) {
    this._identityPoolId = identityPoolId;

    this._lambdaContext = null;
    this._user = null;
    this._credentials = null;
    this._identityMetadata = null;
    this._tokenExpiredCallback = null;

    this._identityProvider = null;
    this._userProvider = null;
    this._logService = null;

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
   * @returns {String}
   */
  get identityPoolId() {
    return this._identityPoolId;
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
   * @param {Object} logService
   */
  set logService(logService) {
    this._logService = logService;
  }

  /**
   * @param {Function} callback
   */
  loadCredentials(callback = () => {}) {
    let event = {
      service: 'deep-security',
      resourceType: 'Cognito',
      resourceId: this._identityPoolId,
      eventName: 'loadCredentials',
      eventId: Security.customEventId(this._identityPoolId),
      time: new Date().getTime(),
    };

    let proxyCallback = (error, credentials) => {
      // log event only after credentials are loaded to get identityId
      this._logService.rumLog(event);

      event = util._extend({}, event);
      event.payload = {error: error, credentials: {}}; // avoid logging user credentials

      this._logService.rumLog(event);

      callback(error, credentials);
    };

    // avoid refreshing or loading credentials for each request
    if (this.validCredentials(this.credentials)) {
      proxyCallback(null, this.credentials);
      return;
    }

    if (this.lambdaContext) {
      this._backendLoadCredentials(proxyCallback);
    } else {
      this._frontendLoadCredentials(proxyCallback);
    }
  }

  /**
   * @param {Function} callback
   * @private
   */
  _backendLoadCredentials(callback) {
    if (!this.lambdaContext) {
      throw new Exception('Call to _backendLoadCredentials method is not allowed from frontend context.');
    }

    this._credsManager.loadBackendCredentials(this.identityId, (error, credentials) => {
      if (error) {
        callback(error, null);
        return;
      }

      callback(null, this._credentials = credentials);
    });
  }

  /**
   * @param {Function} callback
   * @private
   */
  _frontendLoadCredentials(callback) {
    this._credentials = this._createCognitoIdentityCredentials();

    // set AWS credentials before loading credentials from cache coz amazon-cognito-js uses them
    AWS.config.credentials = this._credentials;

    // trying to load old credentials from cache or CognitoSync
    this._credsManager.loadFrontendCredentials((error, credentials) => {
      if (!error && credentials && this.validCredentials(credentials)) {
        callback(null, AWS.config.credentials = this._credentials = credentials);
      } else {
        this._refreshCredentials(this._credentials, callback);
      }
    });
  }

  /**
   * @param {AWS.CognitoIdentityCredentials} credentials
   * @param {Function} callback
   * @private
   */
  _refreshCredentials(credentials, callback) {
    if (!(credentials instanceof AWS.CognitoIdentityCredentials)) {
      let error = new AuthException(
        'Invalid credentials instance. Passed credentials must be an instance of AWS.CognitoIdentityCredentials.'
      );
      callback(error, null);
      return;
    }

    if (this.identityProvider && !this.identityProvider.isTokenValid()) {
      if (typeof this._tokenExpiredCallback === 'function') {
        this._tokenExpiredCallback(this.identityProvider);
      }

      let error = new IdentityProviderTokenExpiredException(
        this.identityProvider.name,
        this.identityProvider.tokenExpirationTime
      );

      callback(error, null);
      return;
    }

    credentials.refresh((error) => {
      if (error) {
        callback(new AuthException(error), null);
        return;
      }

      // @todo - save credentials in background not to affect page load time
      this._credsManager.saveCredentials(credentials, (error, record) => {
        if (error) {
          callback(error, null);
          return;
        }

        callback(null, credentials);
      });
    });
  }

  /**
   * @returns {AWS.CognitoIdentityCredentials}
   * @private
   */
  _createCognitoIdentityCredentials() {
    let cognitoParams = {
      IdentityPoolId: this._identityPoolId,
    };

    if (this.identityProvider) {
      cognitoParams.Logins = {};
      cognitoParams.Logins[this.identityProvider.name] = this.identityProvider.userToken;
      cognitoParams.LoginId = this.identityProvider.userId;
    }

    let credentials = new AWS.CognitoIdentityCredentials(cognitoParams);

    credentials.toJSON = function() {
      return {
        expired: credentials.expired,
        expireTime: credentials.expireTime,
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken,
      };
    }.bind(credentials);

    return credentials;
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

    if (this.credentials) {
      if (this.credentials.identityId) {
        identityId = this.credentials.identityId;
      } else if (this.credentials.params && this.credentials.params.IdentityId) {
        // load IdentityId from localStorage cache
        identityId = this.credentials.params.IdentityId;
      } else if (this._credsManager.identityId) {
        identityId = this._credsManager.identityId;
      }
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
   * @returns {Boolean}
   */
  get isAnonymous() {
    if (this.lambdaContext) {
      return this._identityLogins.length <= 0;
    } else {
      return !this.identityProvider;
    }
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
    if (this.lambdaContext) {
      this._describeIdentity(this.identityId, () => {
        this._loadUser(callback);
      });
    } else {
      this._loadUser(callback);
    }
  }

  /**
   * @param {Function} callback
   * @private
   */
  _loadUser(callback) {
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

  /**
   * @param {Function} callback
   * @returns {Token}
   */
  registerTokenExpiredCallback(callback) {
    if (typeof callback !== 'function') {
      throw new CoreException.InvalidArgumentException(callback, 'function');
    }

    this._tokenExpiredCallback = callback;

    return this;
  }

  /**
   * Removes identity credentials related cached stuff
   */
  destroy() {
    if (!(this._credentials instanceof AWS.CognitoIdentityCredentials)) {
      this._credentials = this._createCognitoIdentityCredentials();
    }

    this._credsManager.deleteCredentials();
    this._credentials.clearCachedId();

    this._credentials = null;
    this._credsManager = null;
  }
}
