/**
 * Created by mgoria on 6/23/15.
 */

'use strict';

import AWS from 'aws-sdk';
import util from 'util';
import {AuthException} from './Exception/AuthException';
import {IdentityProviderTokenExpiredException} from './Exception/IdentityProviderTokenExpiredException';
import {DescribeIdentityException} from './Exception/DescribeIdentityException';
import {Exception} from './Exception/Exception';
import {Exception as CoreException} from 'deep-core';
import {Security} from './Security';
import {TokenManager} from './TokenManager';

/**
 * Security token holds details about logged user
 */
export class Token {
  /**
   * @returns {number}
   */
  static get MAX_RETRIES() {
    return 3;
  }

  /**
   * @returns {number}
   */
  static get RETRIES_INTERVAL_MS() {
    return 200;
  }

  /**
   * @param {String} identityPoolId
   */
  constructor(identityPoolId) {
    this._identityPoolId = identityPoolId;

    this._lambdaContext = null;
    this._user = null;
    this._credentials = null; // stores cognito user (un)authenticated credentials
    this._rolesCredentials = {};
    this._identityMetadata = null;
    this._tokenExpiredCallback = null;

    this._identityProvider = null;
    this._userProvider = null;
    this._roleResolver = null;
    this._logService = null;
    this._cacheService = null;
    this._loadingInProgressSet = {}; // @todo: rethink this functionality
    this._waitingForCredsCallbacksSet = {}; // @todo: rethink this functionality

    this._tokenManager = new TokenManager(identityPoolId);

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
   * @param {Cache|LocalStorageDriver} cacheService
   */
  set cacheService(cacheService) {
    this._cacheService = cacheService;
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
   * @param {RoleResolver} roleResolver
   */
  set roleResolver(roleResolver) {
    this._roleResolver = roleResolver;
  }

  /**
   * @param {Object} user
   */
  set user(user) {
    this._user = user;
  }

  /**
   * @returns {Object}
   */
  get user() {
    return this._user;
  }

  /**
   * @returns {Promise<IdentityProvider>}
   * @private
   */
  _tryLoadIdentityProvider() {
    if (this._identityProvider) {
      return Promise.resolve(this._identityProvider);
    }

    return new Promise(resolve => {
      this._cacheService.get(Token.IDENTITY_PROVIDER_CACHE_KEY, (error, rawProvider) => {
        if (error || !rawProvider) {
          return resolve(null);
        }

        let providerObj = JSON.parse(rawProvider);

        providerObj.tokenExpirationTime = new Date(providerObj.tokenExpirationTime);
        providerObj.isTokenValid = function() {
          return this.tokenExpirationTime > new Date();
        };

        resolve(providerObj);
      });
    })
  }

  /**
   * @param {Function} callback
   * @param {String|null} securityContext
   */
  loadCredentials(callback = () => {}, securityContext = null) {
    let contextKey = securityContext ? securityContext.toString() : 'default';

    if (this._loadingInProgressSet[contextKey]) {
      this._waitingForCredsCallbacksSet[contextKey] = this._waitingForCredsCallbacksSet[contextKey] || [];
      this._waitingForCredsCallbacksSet[contextKey].push(callback);
      return;
    }

    this._loadingInProgressSet[contextKey] = true;

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

      let waitingCallbacks = this._waitingForCredsCallbacksSet[contextKey] || [];

      waitingCallbacks.forEach((cb) => {
        cb(error, credentials);
      });

      this._waitingForCredsCallbacksSet[contextKey] = [];
      this._loadingInProgressSet[contextKey] = false;
    };

    this
      ._tryLoadIdentityProvider()
      .then(identityProvider => {
        this._identityProvider = identityProvider;

        // set AWS credentials before loading credentials from cache coz amazon-cognito-js uses them
        AWS.config.credentials = this.credentials;

        // roleResolver needs default user to be logged in
        return this._loadCognitoUserDefaultCredentials();
      })
      .then(defaultCredentials => {
        if (!securityContext) {
          return defaultCredentials;
        }

        return this._roleResolver
          .resolve(securityContext)
          .then(role => {
            let credentials = this.getCredentials(role);

            if (this.validCredentials(credentials)) {
              return credentials;
            }

            return this.lambdaContext ?
              this._backendLoadCredentials(role) :
              this._frontendLoadCredentials(role);
          });
      })
      .then(credentials => proxyCallback(null, credentials))
      .catch(error => proxyCallback(error, null));
  }

  /**
   * @returns {Promise}
   * @private
   */
  _loadCognitoUserDefaultCredentials() {
    return this.validCredentials(this.credentials) ?
      Promise.resolve(this.credentials) :
      this.lambdaContext ?
        this._backendLoadCredentials() :
        this._frontendLoadCredentials();
  }

  /**
   * @param {Object|null} role
   * @returns {Promise<AWS.CognitoIdentityCredentials>}
   * @private
   */
  _backendLoadCredentials(role = null) {
    if (!this.lambdaContext) {
      throw new Exception('Call to _backendLoadCredentials method is not allowed from frontend context.');
    }

    return this._tokenManager
      .loadBackendToken(this.identityId)
      .then(oldToken => {
        this._fillFromTokenSnapshot(oldToken);

        return this.getCredentials(role);
      });
  }

  /**
   * @param {Object|null} role
   * @returns {Promise<AWS.CognitoIdentityCredentials>}
   * @private
   */
  _frontendLoadCredentials(role = null) {
    // trying to load old token from cache or CognitoSync
    return this._tokenManager
      .loadFrontendToken()
      .then(oldToken => {
        if (!oldToken) {
          return Promise.reject(new AuthException('Missing old token snapshot'));
        }

        this._fillFromTokenSnapshot(oldToken);
        let credentials = this.getCredentials(role);

        if (!this.validCredentials(credentials)) {
          return Promise.reject(new AuthException('Invalid or expired token credentials'));
        }

        return credentials;
      })
      .catch(() => {
        let credentials = this.getCredentials(role) || this._createCognitoIdentityCredentials(role);

        return this._refreshCredentials(credentials);
      })
      .then(credentials => {
        // amazon-cognito-js sets credentials to `undefined` while saving them (tokenManager.identityId returns null)
        setTimeout(() => {
          this._saveCredentials(credentials, role);
          this._saveToken();
        }, 0);

        return credentials;
      });
  }

  /**
   * @param {Object} tokenSnapshot
   * @returns {Token}
   * @private
   */
  _fillFromTokenSnapshot(tokenSnapshot) {
    AWS.config.credentials = this._credentials = tokenSnapshot.credentials;
    this._rolesCredentials = tokenSnapshot.rolesCredentials;

    return this;
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
      if (typeof this._tokenExpiredCallback === 'function') {
        this._tokenExpiredCallback(this.identityProvider);
      }

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
   * @param {CognitoIdentityCredentials} credentials
   * @param {Object} role
   * @returns {Token}
   * @private
   */
  _saveCredentials(credentials, role = null) {
    if (role) {
      this._rolesCredentials[this.roleSessionKey(role)] = credentials;
    } else {
      this._credentials = credentials;
    }

    return this;
  }

  /**
   * @returns {Promise}
   * @private
   */
  _saveToken() {
    if (this._identityProvider) {
      let identityProviderObj = {
        name: this._identityProvider.name,
        userToken: this._identityProvider.userToken,
        tokenExpirationTime: this._identityProvider.tokenExpirationTime,
        userId: this._identityProvider.userId,
      };

      this._cacheService.set(
        Token.IDENTITY_PROVIDER_CACHE_KEY,
        JSON.stringify(identityProviderObj)
      );
    }

    return this._tokenManager.saveToken(this);
  }

  /**
   * @param {Object} role
   * @returns {CognitoIdentityCredentials}
   * @private
   */
  _createCognitoIdentityCredentials(role = null) {
    let cognitoParams = {
      IdentityPoolId: this._identityPoolId,
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

    return new AWS.CognitoIdentityCredentials(cognitoParams);
  }

  /**
   * @returns {String}
   */
  get identityId() {
    let identityId = null;
    let credentials = this.credentials;

    if (this.lambdaContext) {
      identityId = this.lambdaContext.identity.cognitoIdentityId;
    } else if (credentials) {
      if (credentials.identityId) {
        identityId = credentials.identityId;
      } else if (credentials.params && credentials.params.IdentityId) {
        // load IdentityId from localStorage cache
        identityId = credentials.params.IdentityId;
      } else if (this._tokenManager.identityId) {
        identityId = this._tokenManager.identityId;
      }
    }

    return identityId;
  }

  /**
   * @returns {AWS.CognitoIdentityCredentials}
   */
  get credentials() {
    if (!this._credentials) {
      this._credentials = this._createCognitoIdentityCredentials();
    }

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
   * @param {Object|null} role
   * @returns {AWS.CognitoIdentityCredentials}
   */
  getCredentials(role = null) {
    return role ? this._rolesCredentials[this.roleSessionKey(role)] : this.credentials;
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
      this._userProvider.loadUserByIdentityId(this.identityId, (error, user) => {
        if (error) {
          callback(error, null);
          return;
        }

        this._user = user;

        callback(null, this._user);
      });

      return;
    }

    callback(null, this._user);
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
   * @param {Object|null} role
   * @returns {*}
   */
  roleSessionKey(role) {
    let suffix = role ? role.Id : 'default';

    return `${TokenManager.RECORD_NAME}-${suffix}`;
  }

  /**
   * Removes identity credentials related cached stuff
   */
  destroy() {
    this._tokenManager.deleteToken();
    this._roleResolver.invalidateCache();

    this.credentials.clearCachedId();
    for (let key in this._rolesCredentials) {
      if (this._rolesCredentials.hasOwnProperty(key)) {
        this._rolesCredentials[key].clearCachedId();
      }
    }

    this._credentials = null;
    this._rolesCredentials = {};
    this._tokenManager = null;
  }

  /**
   * @returns {Object}
   */
  toJSON() {
    let jsonToken = {
      credentials: this._credentials && this._extractCredentials(this._credentials),
      rolesCredentials: {},
    };

    for (let key in this._rolesCredentials) {
      if (this._rolesCredentials.hasOwnProperty(key)) {
        jsonToken.rolesCredentials[key] = this._extractCredentials(this._rolesCredentials[key]);
      }
    }

    return jsonToken;
  }

  /**
   * @param {AWS.CognitoIdentityCredentials} credentials
   * @returns {Object}
   * @private
   */
  _extractCredentials(credentials) {
    return {
      expired: credentials.expired,
      expireTime: credentials.expireTime,
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken,
    };
  }

  /**
   * @param {String} identityPoolId
   * @returns {String}
   */
  static getRegionFromIdentityPoolId(identityPoolId) {
    return identityPoolId.split(':')[0];
  }

  /**
   * @param {String} identityPoolId
   * @returns {Token}
   */
  static create(identityPoolId) {
    return new this(identityPoolId);
  }

  /**
   * @param {String} identityPoolId
   * @param {IdentityProvider} identityProvider
   * @returns {Token}
   */
  static createFromIdentityProvider(identityPoolId, identityProvider) {
    let token = new this(identityPoolId);
    token.identityProvider = identityProvider;

    return token;
  }

  /**
   * @param {String} identityPoolId
   * @param {Object} lambdaContext
   * @returns {Token}
   */
  static createFromLambdaContext(identityPoolId, lambdaContext) {
    let token = new this(identityPoolId);
    token.lambdaContext = lambdaContext;

    return token;
  }

  /**
   * @returns {String}
   */
  static get IDENTITY_PROVIDER_CACHE_KEY() {
    return '__deep_framework|security|token|identity-provider';
  }
}
