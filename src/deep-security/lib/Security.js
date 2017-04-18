/**
 * Created by mgoria on 6/17/15.
 */

'use strict';

import Kernel from 'deep-kernel';
import Core from 'deep-core';
import {Exception} from './Exception/Exception';
import {Token} from './Token';
import {LocalToken} from './LocalToken';
import {FrontendUserProvider} from './FrontendUserProvider';
import {BackendUserProvider} from './BackendUserProvider';
import {IdentityProvider} from './IdentityProvider';
import {LocalIdentityProvider} from './LocalIdentityProvider';
import {RoleResolver} from './RoleResolver';
import {RoleProvider} from './RoleProvider';
import util from 'util';
import crypto from 'crypto';
import AWS from 'aws-sdk';

/**
 * Deep Security implementation
 */
export class Security extends Kernel.ContainerAware {
  /**
   * Defines all class private properties
   *
   * @param {String} identityPoolId
   * @param {Object} identityProviders
   */
  constructor(identityPoolId = null, identityProviders = {}) {
    super();

    this._identityPoolId = identityPoolId;
    this._identityProviders = identityProviders;

    this._token = null;
    this._userProvider = null;
    this._userProviderEndpoint = null;
    this._userModelName = null;
    this._roleProviderEndpoint = null;
    this._roleResolver = null;
    this._roleProvider = null;
  }

  /**
   * @returns {String}
   */
  get identityPoolId() {
    return this._identityPoolId;
  }

  /**
   * @returns {*}
   */
  get userProvider() {
    if (!this._userProvider) {
      if (this.kernel.isFrontend) {
        this._userProvider = new FrontendUserProvider(this._userProviderEndpoint, this._resourceService);
      } else {
        this._userProvider = new BackendUserProvider(this._userModelName, this.container.get('db'));
      }
    }

    return this._userProvider;
  }

  /**
   * @returns {RoleResolver}
   */
  get roleResolver() {
    if (!this._roleResolver) {
      this._roleResolver = new RoleResolver(this.roleProvider);
    }

    return this._roleResolver;
  }

  /**
   * @returns {RoleProvider}
   */
  get roleProvider() {
    if (!this._roleProvider) {
      this._roleProvider = new RoleProvider(this._resourceService, this._roleProviderEndpoint);
    }

    return this._roleProvider;
  }

  /**
   * Booting a certain service
   *
   * @param {Kernel} kernel
   * @param {Function} callback
   */
  boot(kernel, callback) {
    let globals = kernel.config.globals;

    this._identityPoolId = kernel.config.identityPoolId;
    this._identityProviders = kernel.config.identityProviders || {};
    this._userProviderEndpoint = globals.userProviderEndpoint || null;
    this._userModelName = globals.userModelName || 'User';
    this._roleProviderEndpoint = globals.roleProviderEndpoint || null;

    callback();
  }

  /**
   * @inheritDoc
   */
  cleanup() {
    this.roleProvider.invalidateCache();

    if (this._token) {
      this._token.user = null;
    }
  }

  /**
   * @returns {null|Token}
   */
  get token() {
    return this._token;
  }

  /**
   * @param {String} providerName
   * @param {Object} identityMetadata
   * @param {Function} callback
   * @returns {Token}
   */
  login(providerName, identityMetadata, callback) {
    let TokenImplementation = LocalToken;
    let IdentityProviderImplementation = LocalIdentityProvider;

    if (!this._localBackend) {
      TokenImplementation = Token;
      IdentityProviderImplementation = IdentityProvider;
    }

    let identityProvider = new IdentityProviderImplementation(this._identityProviders, providerName, identityMetadata);
    this._token = TokenImplementation.createFromIdentityProvider(this._identityPoolId, identityProvider);

    this._token.roleResolver = this.roleResolver;
    this._token.userProvider = this.userProvider;
    this._token.cacheService = this._cacheService;
    this._token.logService = this.kernel.get('log');

    let event = {
      eventName: 'login',
      eventId: Security.customEventId(this.identityPoolId),
      payload: {providerName, identityMetadata},
      time: new Date().getTime(),
    };

    this._token.loadCredentials((error, credentials) => {
      this._logRumEvent(event);

      event = util._extend({}, event);
      event.payload = {credentials};

      this._logRumEvent(event);

      callback(error, this._token);
    });

    return this._token;
  }

  /**
   * @param {Function} callback
   * @returns {Token}
   */
  anonymousLogin(callback) {
    let TokenImplementation = this._localBackend ? LocalToken : Token;

    this._token = TokenImplementation.create(this.identityPoolId);

    this._token.userProvider = this.userProvider;
    this._token.roleResolver = this.roleResolver;
    this._token.cacheService = this._cacheService;
    this._token.logService = this.kernel.get('log');

    let event = {
      eventName: 'anonymousLogin',
      eventId: Security.customEventId(this.identityPoolId),
      time: new Date().getTime(),
    };

    this._token.loadCredentials((error, credentials) => {
      this._logRumEvent(event);

      event = util._extend({}, event);
      event.payload = {credentials};

      this._logRumEvent(event);

      callback(error, this._token);
    });

    return this._token;
  }

  /**
   * @param {Object} lambdaContext
   * @returns {Promise}
   */
  warmupBackendLogin(lambdaContext) {
    if (this.kernel.isFrontend) {
      throw new Exception('Call to warmupBackendLogin method is not allowed from frontend context.');
    }

    if (AWS.config.credentials instanceof AWS.EnvironmentCredentials) {
      // store lambda default credentials, in order to be able to switch from an account to another
      Core.AWS.ENV_CREDENTIALS = AWS.config.credentials;
    }

    let TokenImplementation = this._localBackend ? LocalToken : Token;

    this._token = TokenImplementation.createFromLambdaContext(this._identityPoolId, lambdaContext);

    this._token.userProvider = this.userProvider;
    this._token.logService = this.kernel.get('log');
    this._token.roleResolver = this.roleResolver;
    this._token.cacheService = this._cacheService;

    return this.kernel.config.forceUserIdentity && this.kernel.accountMicroservice ?
      this._token.loadLambdaCredentials() :
      Promise.resolve(Core.AWS.ENV_CREDENTIALS);
  }

  /**
   * Destroys user session
   *
   * @returns {Promise}
   */
  logout() {
    this._logRumEvent({
      eventName: 'logout',
    });

    if (this._token) {
      return this._token.destroy().then(() => {
        this._roleProvider.invalidateCache();
        this._token = null;
        return this;
      });
    }

    return Promise.resolve(this);
  }

  /**
   * @param {Object} customData
   * @returns {Boolean}
   * @private
   */
  _logRumEvent(customData) {
    if (this.kernel && !this.kernel.isRumEnabled) {
      return false;
    }

    let logService = this.kernel.get('log');
    let event = util._extend(customData, {
      service: 'deep-security',
      resourceType: 'Cognito',
      resourceId: this.identityPoolId,
    });

    logService.rumLog(event);

    return true;
  }

  /**
   * @param {String} identityPoolId
   * @returns {String}
   */
  static customEventId(identityPoolId) {
    return Security._md5(identityPoolId + new Date().getTime());
  }

  /**
   * @todo - move all this utils methods into separate class somewhere in deep-core or deep-kernel
   *
   * @param {String} str
   * @returns {String}
   */
  static _md5(str) {
    var md5sum = crypto.createHash('md5');

    md5sum.update(str);

    return md5sum.digest('hex');
  }

  /**
   * @returns {Object}
   */
  get _resourceService() {
    return this.container.get('resource');
  }

  /**
   * @returns {Cache|LocalStorageDriver}
   * @private
   */
  get _cacheService() {
    return this.container.get('cache');
  }
}
