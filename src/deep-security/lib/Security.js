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
   * @returns {Object}
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
    // @todo: remove this compatibility hook
    let globals = kernel.config.globals || kernel.config;

    this._identityProviders = globals.security.identityProviders;
    this._userProviderEndpoint = globals.userProviderEndpoint;

    this._identityPoolId = kernel.config.identityPoolId;

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
   * @param {String} userToken
   * @param {String} userId
   * @param {Function} callback
   * @returns {Token}
   */
  login(providerName, userToken, userId, callback) {
    let identityProvider = new IdentityProvider(this._identityProviders, providerName, userToken, userId);

    let TokenImplementation = this._localBackend ? LocalToken : Token;

    this._token = TokenImplementation.createFromIdentityProvider(this._identityPoolId, identityProvider);

    this._token.userProvider = this.userProvider;

    this._token.loadCredentials((error, credentials) => {
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

    this._token = TokenImplementation.create(this._identityPoolId);

    this._token.userProvider = this.userProvider;

    this._token.loadCredentials((error, credentials) => {
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

    return this._token;
  }
}
