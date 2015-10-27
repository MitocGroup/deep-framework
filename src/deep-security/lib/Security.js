/**
 * Created by mgoria on 6/17/15.
 */

'use strict';

import Kernel from 'deep-kernel';
import {MissingLoginProviderException} from './Exception/MissingLoginProviderException';
import {Token} from './Token';
import {LocalToken} from './LocalToken';
import {UserProvider} from './UserProvider';

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

    this._onTokenAvailable = [];
  }

  /**
   * @param {Function} callback
   * @returns {Security}
   */
  onTokenAvailable(callback) {
    this._onTokenAvailable.push(callback);

    return this;
  }

  /**
   * @returns {string}
   */
  static get PROVIDER_AMAZON() {
    return 'www.amazon.com';
  }

  /**
   * @returns {string}
   */
  static get PROVIDER_FACEBOOK() {
    return 'graph.facebook.com';
  }

  /**
   * @returns {string}
   */
  static get PROVIDER_GOOGLE() {
    return 'accounts.google.com';
  }

  /**
   * @returns {Object}
   */
  get identityProviders() {
    return this._identityProviders;
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
   * @param {String} name
   * @returns {Object}
   */
  getLoginProviderConfig(name) {
    for (let providerName in this._identityProviders) {
      if (!this._identityProviders.hasOwnProperty(providerName)) {
        continue;
      }

      if (providerName === name) {
        return this._identityProviders[providerName];
      }
    }

    throw new MissingLoginProviderException(name);
  }

  /**
   * @returns {Object}
   */
  get amazonLoginProviderConfig() {
    return this.getLoginProviderConfig(Security.PROVIDER_AMAZON);
  }

  /**
   * @returns {Object}
   */
  get facebookLoginProviderConfig() {
    return this.getLoginProviderConfig(Security.PROVIDER_FACEBOOK);
  }

  /**
   * @returns {Object}
   */
  get googleLoginProviderConfig() {
    return this.getLoginProviderConfig(Security.PROVIDER_GOOGLE);
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
    // check if providerName is defined
    this.getLoginProviderConfig(providerName);

    let TokenImplementation = this._localBackend ? LocalToken : Token;

    this._token = new TokenImplementation(this._identityPoolId, providerName, userToken, userId);

    this._token.userProvider = this.userProvider;

    this._token.getCredentials((...args) => {
      for (let hookKey in this._onTokenAvailable) {
        if (!this._onTokenAvailable.hasOwnProperty(hookKey)) {
          continue;
        }

        this._onTokenAvailable[hookKey](this._token);
      }

      callback(...args);
    });

    return this._token;
  }

  /**
   * @param {Function} callback
   * @returns {Token}
   */
  anonymousLogin(callback) {
    let TokenImplementation = this._localBackend ? LocalToken : Token;

    this._token = new TokenImplementation(this._identityPoolId);

    this._token.userProvider = this.userProvider;

    this._token.getCredentials((...args) => {
      for (let hookKey in this._onTokenAvailable) {
        if (!this._onTokenAvailable.hasOwnProperty(hookKey)) {
          continue;
        }

        this._onTokenAvailable[hookKey](this._token);
      }

      callback(...args);
    });

    return this._token;
  }
}
