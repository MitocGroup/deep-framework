/**
 * Created by mgoria on 6/23/15.
 */

'use strict';

import AWS from 'aws-sdk';
import Core from 'deep-core';
import util from 'util';
import {IdentityProviderTokenExpiredException} from './Exception/IdentityProviderTokenExpiredException';
import {DescribeIdentityException} from './Exception/DescribeIdentityException';
import {Exception as CoreException} from 'deep-core';
import {Security} from './Security';
import {TokenManager} from './TokenManager';
import {CredentialsManager} from './CredentialsManager';

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
    this._identityMetadata = null;
    this._tokenExpiredCallback = null;

    this._identityProvider = null;
    this._userProvider = null;
    this._roleResolver = null;
    this._logService = null;
    this._cacheService = null;

    this._credsPromises = {};

    this._tokenManager = new TokenManager(identityPoolId);
    this._credentialsManager = new CredentialsManager(this);
    this._sts = new AWS.STS();

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
   * @returns {CredentialsManager}
   */
  get credentialsManager() {
    return this._credentialsManager;
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
        providerObj.isTokenValid = function () { // do not use arrow function, `this` context should not be overwritten
          return this.tokenExpirationTime > new Date();
        };

        resolve(providerObj.isTokenValid() ? providerObj : null);
      });
    });
  }

  /**
   * Example: token.isAllowed('deep-security:role:create').then(boolean => {});
   *
   * @param {String} authScope
   * @returns {Promise}
   */
  isAllowed(authScope) {
    return this._roleResolver
      .resolve(authScope)
      .then(role => {
        return !!role;
      });
  }

  /**
   * @returns {Promise}
   */
  loadLambdaCredentials() {
    return new Promise(
      (resolve, reject) => {
        this._cacheService.get('credentialsCache', (error, credentialsCache) => {
          if (error && error.name !== 'MissingCacheException') {
            return reject(error);
          }

          credentialsCache = credentialsCache || {default: Core.AWS.ENV_CREDENTIALS,};

          this._sts.config.credentials = credentialsCache.default;

          this.getUser((error, user) => {
            if (error) {
              return reject(error);
            }

            if (!user || !user.ActiveAccount || !user.ActiveAccount.BackendRole) {
              return resolve(credentialsCache.default);
            }

            let awsRole = user.ActiveAccount.BackendRole;

            if (credentialsCache.hasOwnProperty(awsRole.Arn) &&
              this._credentialsManager.validCredentials(credentialsCache[awsRole.Arn])) {

              return resolve(credentialsCache[awsRole.Arn]);
            }

            let stsParams = {
              RoleArn: awsRole.Arn,
              RoleSessionName: `backend-role-${awsRole.Name}`
            };

            this._stsAssumeRole(stsParams)
              .then(response => {
                let credentialsObj = response.Credentials;

                let credentials = new AWS.Credentials({
                  accessKeyId: credentialsObj.AccessKeyId,
                  secretAccessKey: credentialsObj.SecretAccessKey,
                  sessionToken: credentialsObj.SessionToken,
                });

                credentials.expireTime = credentialsObj.Expiration;

                credentialsCache[awsRole.Arn] = credentials;

                // save backend credentials asynchronously
                this._cacheService.set('credentialsCache', credentialsCache);

                return resolve(credentialsCache[awsRole.Arn]);
              })
              .catch(reject);
          });
        });
      }
    );
  }

  /**
   * @param {Object} stsParams
   * @param {Number} _retryCount
   * @returns {Promise}
   * @private
   */
  _stsAssumeRole(stsParams, _retryCount = 0) {
    return this._sts.assumeRole(stsParams)
      .promise()
      .catch(e => {
        if (_retryCount++ < TokenManager.MAX_RETRIES) {
          console.warn(`Retrying "sts:assumeRole" with params: ${JSON.stringify(stsParams)}`);

          return new Promise((resolve, reject) => {
            setTimeout(
              () => {
                this._stsAssumeRole(stsParams, _retryCount)
                  .then(resolve)
                  .catch(reject);
              },
              Math.pow(2, _retryCount) * 1000
            );
          })
        }

        throw e;
      });
  }

  /**
   * @param {Function} callback
   * @param {String|null} authScope
   * @returns {Promise}
   */
  loadCredentials(callback = () => {}, authScope = null) {
    let scopeKey = authScope ? authScope.toString() : 'default';

    let event = {
      service: 'deep-security',
      resourceType: 'Cognito',
      resourceId: this._identityPoolId,
      eventName: 'loadCredentials',
      eventId: Security.customEventId(this._identityPoolId),
      time: new Date().getTime(),
    };

    let proxyCallback = (error, credentials) => {
      if (error instanceof IdentityProviderTokenExpiredException && typeof this._tokenExpiredCallback === 'function') {
        this._tokenExpiredCallback(this.identityProvider);
        this._identityProvider = null;
      }

      // log event only after credentials are loaded to get identityId
      this._logService.rumLog(event);
      event = util._extend({}, event);
      event.payload = {error: error, credentials: {}}; // avoid logging user credentials
      this._logService.rumLog(event);

      delete this._credsPromises[scopeKey];

      // run callback async, to avoid catching sync errors
      setTimeout(() => {
        callback(error, credentials);
      }, 0);
    };

    if (!this._credsPromises.hasOwnProperty(scopeKey)) {
      this._credsPromises[scopeKey] = this._tryLoadIdentityProvider()
        .then(identityProvider => {
          this._identityProvider = identityProvider;

          return this._loadTokenSnapshot();
        })
        .then(tokenSnapshot => {
          if (tokenSnapshot) {
            this._fillFromTokenSnapshot(tokenSnapshot);
          }

          return this._credentialsManager.getCredentials();
        })
        .then(defaultCredentials => {
          if (!authScope) {
            return defaultCredentials;
          }

          // roleResolver needs system credentials to be loaded
          return this._roleResolver
            .resolve(authScope)
            .then(role => {
              return this._credentialsManager.getCredentials(role);
            });
        })
        .then(credentials => {
          if (!this.lambdaContext) {
            return this._saveToken().then(() => credentials).catch(() => Promise.resolve(credentials));
          }

          return credentials;
        });
    }

    return this._credsPromises[scopeKey]
      .then(credentials => proxyCallback(null, credentials))
      .catch(error => proxyCallback(error, null));
  }

  /**
   * @returns {*}
   * @private
   */
  _loadTokenSnapshot() {
    return this._credentialsManager.getCredentials(null, false).then(credentials => {
      if (this._credentialsManager.validCredentials(credentials)) {
        return null; // do not load token snapshot if credentials are already valid
      } else if (this.lambdaContext) {
        return this._tokenManager.loadBackendToken(this.identityId);
      } else {
        AWS.config.credentials = credentials; // CognitoSyncClient requires credentials to be set
        return this._tokenManager.loadFrontendToken();
      }
    });
  }

  /**
   * @param {Object} tokenSnapshot
   * @returns {Token}
   * @private
   */
  _fillFromTokenSnapshot(tokenSnapshot) {
    if (this._credentialsManager.validCredentials(tokenSnapshot.credentials)) {
      this._credentialsManager.systemCredentials = tokenSnapshot.credentials;
      this._credentialsManager.rolesCredentials = tokenSnapshot.rolesCredentials;
    }

    return this;
  }

  /**
   * @returns {Promise}
   * @private
   */
  _saveToken() {
    if (this._credentialsManager.identityProvider) {
      let identityProviderObj = {
        name: this._identityProvider.name,
        userToken: this._identityProvider.userToken,
        tokenExpirationTime: this._identityProvider.tokenExpirationTime,
        userId: this._identityProvider.userId,
      };

      this._cacheService.set(
        Token.IDENTITY_PROVIDER_CACHE_KEY,
        JSON.stringify(identityProviderObj),
        parseInt((identityProviderObj.tokenExpirationTime.getTime() - Date.now()) / 1000)
      );
    }

    return this._tokenManager.saveToken(this);
  }

  /**
   * @returns {String}
   */
  get identityId() {
    let identityId = null;
    let credentials = this.credentialsManager.systemCredentials;

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

    if (this.lambdaContext) {
      this._describeIdentity(this.identityId).then(() => {
        this._loadUser(argsHandler);
      }).catch(argsHandler);
    } else {
      this._loadUser(argsHandler);
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
   * @returns {Promise}
   * @private
   */
  _describeIdentity(identityId) {
    if (this._identityMetadata) {
      return Promise.resolve(this._identityMetadata);
    }

    let cognitoIdentity = new AWS.CognitoIdentity({
      credentials: Core.AWS.ENV_CREDENTIALS,
    });

    return cognitoIdentity.describeIdentity({IdentityId: identityId})
      .promise()
      .then(data => {
        this._identityMetadata = data;
        
        return data;
      })
      .catch(error => {
        throw new DescribeIdentityException(identityId, error);
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
   * @returns {Promise}
   */
  destroy() {
    return Promise.all(
      Object.keys(this._credsPromises).map(k => this._credsPromises[k])
    ).catch(e => Promise.resolve(null)).then(() => { // clear cache, even on credentials load error
      this._credentialsManager.clearCache();
      this._tokenManager.deleteToken();
      this._cacheService.invalidate(Token.IDENTITY_PROVIDER_CACHE_KEY);
      this._credsPromises = {};
      this._identityProvider = null;
    });
  }

  /**
   * @returns {Object}
   */
  toJSON() {
    return {
      credentials: this._credentialsManager.systemCredentials,
      rolesCredentials: this._credentialsManager.rolesCredentials,
      identityId: this.identityId,
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
