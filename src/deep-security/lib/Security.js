/**
 * Created by mgoria on 6/17/15.
 */

'use strict';

import Kernel from 'deep-kernel';
import {Exception} from './Exception/Exception';
import {Token} from './Token';
import {LocalToken} from './LocalToken';
import {UserProvider} from './UserProvider';
import {IdentityProvider} from './IdentityProvider';
import util from 'util';
import crypto from 'crypto';

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
  }

  /**
   * @returns {String}
   */
  get identityPoolId() {
    return this._identityPoolId;
  }

  /**
   * @returns {UserProvider}
   */
  get userProvider() {
    if (!this._userProvider) {
      this._userProvider = new UserProvider(this._userProviderEndpoint, this.container.get('resource'));
    }

    return this._userProvider;
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

    callback();
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
    let identityProvider = null;
    let TokenImplementation = LocalToken;

    if (!this._localBackend) {
      TokenImplementation = Token;
      identityProvider = new IdentityProvider(this._identityProviders, providerName, identityMetadata);
    }

    this._token = TokenImplementation.createFromIdentityProvider(this._identityPoolId, identityProvider);

    this._token.userProvider = this.userProvider;
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
   * @returns {Token}
   */
  warmupBackendLogin(lambdaContext) {
    if (this.kernel.isFrontend) {
      throw new Exception('Call to warmupBackendLogin method is not allowed from frontend context.');
    }

    let TokenImplementation = this._localBackend ? LocalToken : Token;

    this._token = TokenImplementation.createFromLambdaContext(this._identityPoolId, lambdaContext);

    this._token.userProvider = this.userProvider;
    this._token.logService = this.kernel.get('log');

    return this._token;
  }

  /**
   * Destroys user session
   *
   * @returns {Security}
   */
  logout() {
    this._logRumEvent({
      eventName: 'logout',
    });

    if (this._token) {
      this._token.destroy();
    }

    this._token = null;

    return this;
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
}
