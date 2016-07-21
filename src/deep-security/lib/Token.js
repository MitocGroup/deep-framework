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
    this._credentials = null; // stores cognito user credentials
    this._credentialsSet = {};
    this._identityMetadata = null;
    this._tokenExpiredCallback = null;

    this._identityProvider = null;
    this._userProvider = null;
    this._roleResolver = null;
    this._logService = null;
    this._loadingInProgress = false;
    this._waitingForCredsCallbacks = [];

    this._sts = new AWS.STS();
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
   * @param {Function} callback
   * @param {String|null} context
   */
  loadCredentials(callback = () => {}, context = null) {
    if (this._loadingInProgress) {
      this._waitingForCredsCallbacks.push(callback);
      return;
    }

    AWS.config.credentials = this.credentials; // setup coginto user credentials, to be able to retrieve cognitoIdentityId
    this._loadingInProgress = true;

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

      this._waitingForCredsCallbacks.forEach((cb) => {
        cb(error, credentials);
      });

      this._waitingForCredsCallbacks = [];
      this._loadingInProgress = false;
    };

    this
      ._loadCognitoUserCredentials() // roleResolver needs the user to be logged in
      .then(credentials => {
        if (!context) {
          return proxyCallback(null, credentials);
        }

        return this._roleResolver
          .resolve(context)
          .then(role => {
            if (this.lambdaContext) {
              this._backendLoadCredentials(proxyCallback, role);
            } else {
              this._frontendLoadCredentials(proxyCallback, role);
            }
          });
      })
      .catch(error => {
        proxyCallback(null, error);
      });
  }

  /**
   * @returns {Promise}
   * @private
   */
  _loadCognitoUserCredentials() {
    if (this.validCredentials(this.credentials)) {
      return Promise.resolve(this.credentials);
    } else {
      return new Promise((resolve, reject) => {
        let loadMethod = this.lambdaContext ?
          this._backendLoadCredentials :
          this._frontendLoadCredentials;

        loadMethod.call(this, (error, credentials) => {
          if (error) {
            return reject(error);
          }

          resolve(credentials);
        });
      });
    }
  }

  /**
   * @param {Function} callback
   * @param {Object|null} role
   * @private
   */
  _backendLoadCredentials(callback, role = null) {
    if (!this.lambdaContext) {
      throw new Exception('Call to _backendLoadCredentials method is not allowed from frontend context.');
    }

    this._credsManager.loadBackendCredentials(this.identityId, role, (error, credentials) => {
      if (error) {
        callback(error, null);
        return;
      }

      if (role) {
        this._credentialsSet[this.roleSessionKey(role)] = credentials;
      } else {
        this._credentials = credentials; // cognito credentials should be stored separated from all other credentials
      }

      callback(null, credentials);
    });
  }

  /**
   * @param {Function} callback
   * @param {Object|null} role
   * @private
   */
  _frontendLoadCredentials(callback, role = null) {
    // trying to load old credentials from cache or CognitoSync
    this._credsManager.loadFrontendCredentials(role, (error, credentials) => {
      if (!error && credentials && this.validCredentials(credentials)) {
        if (role) {
          this._credentialsSet[this.roleSessionKey(role)] = credentials;
        } else {
          this._credentials = credentials; // cognito credentials should be stored separated from all other credentials
        }

        AWS.config.credentials = credentials;

        callback(null, credentials);
      } else {
        this._refreshCredentials(this.credentials, role, callback);
      }
    });
  }

  /**
   * @param {AWS.CognitoIdentityCredentials} credentials
   * @param {Object} role
   * @param {Function} callback
   * @private
   */
  _refreshCredentials(credentials, role, callback) {
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

    let refreshCredentialsPromise = role ?
      this._stsRefreshCredentials(role) :
      this._cognitoRefreshCredentials(credentials);

    refreshCredentialsPromise
      .then(credentials => {
        // save credentials in background in order to not affect page load time
        this._saveCredentials(role, credentials);

        callback(null, credentials);
      })
      .catch(error => callback(error, null));
  }

  /**
   * @param {Object} role
   * @returns {Promise}
   * @private
   */
  _stsRefreshCredentials(role) {
    if (!(role && role.IamRole)) {
      let error = new AuthException(`Invalid role instance. Role must be linked to an IAM role`);

      return Promise.reject(error);
    }

    let iamRole = role.IamRole;
    let params = {
      RoleArn: iamRole.Arn,
      RoleSessionName: this.roleSessionKey(role),
      WebIdentityToken: this.identityProvider.userToken,
      ProviderId: this.identityProvider.name,
    };

    return this._sts
      .assumeRoleWithWebIdentity(params)
      .promise()
      .then(data => {
        let credentials = data.Credentials;

        AWS.config.credentials = credentials;
        this._credentialsSet[this.roleSessionKey(role)] = credentials;

        return credentials;
      });
  }

  /**
   * @param {Object} credentials
   * @returns {Promise}
   * @private
   */
  _cognitoRefreshCredentials(credentials) {
    return new Promise((resolve, reject) => {
      credentials.refresh((error) => {
        if (error) {
          return reject(new AuthException(error));
        }

        resolve(credentials);
      });
    });
  }

  /**
   * @param {Object} role
   * @param {Object} credentials
   * @private
   */
  _saveCredentials(role, credentials) {
    let retriesCount = 0;

    var saveCredentialsFunc = () => {
      if (!this._credsManager) {
        return;
      }

      this._credsManager.saveCredentials(role, credentials, (error, record) => {
        if (error) {
          retriesCount++;

          if (retriesCount <= Token.MAX_RETRIES) {
            setTimeout(saveCredentialsFunc, Token.RETRIES_INTERVAL_MS * retriesCount);
          } else {
            throw error;
          }
        }
      });
    };

    saveCredentialsFunc();
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
    let credentials = this.credentials;

    if (credentials) {
      if (credentials.identityId) {
        identityId = credentials.identityId;
      } else if (credentials.params && credentials.params.IdentityId) {
        // load IdentityId from localStorage cache
        identityId = credentials.params.IdentityId;
      } else if (this._credsManager.identityId) {
        identityId = this._credsManager.identityId;
      }
    } else if (this.lambdaContext) {
      identityId = this.lambdaContext.identity.cognitoIdentityId;
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
   * @param {String} identityPoolId
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
    return this._credsManager.roleRecord(role);
  }

  /**
   * Removes identity credentials related cached stuff
   */
  destroy() {
    this._credsManager.deleteCredentials();
    this._roleResolver.invalidateCache();

    this.credentials.clearCachedId();
    for (let key in this._credentialsSet) {
      if (this._credentialsSet.hasOwnProperty(key)) {
        this._credentialsSet[key].clearCachedId();
      }
    }

    this._credentials = null;
    this._credentialsSet = {};
    this._credsManager = null;
  }
}
