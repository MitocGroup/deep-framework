/**
 * Created by mgoria on 11/12/15.
 */

'use strict';

import {MissingLoginProviderException} from './Exception/MissingLoginProviderException';
import {IdentityProviderMismatchException} from './Exception/IdentityProviderMismatchException';

/**
 * 3rd Party identity provider (Amazon, Facebook, Google, etc.)
 */
export class IdentityProvider {
  /**
   * @returns {string}
   */
  static get AMAZON() {
    return 'www.amazon.com';
  }

  /**
   * @returns {string}
   */
  static get FACEBOOK() {
    return 'graph.facebook.com';
  }

  /**
   * @returns {string}
   */
  static get GOOGLE() {
    return 'accounts.google.com';
  }

  /**
   * @param {String} providerName
   * @returns {Array}
   */
  static ALIASES(providerName) {
    let aliases = [];

    switch(providerName) {
      case IdentityProvider.AMAZON:
        aliases = ['www.amazon.com', 'amazon'];
        break;
      case IdentityProvider.FACEBOOK:
        aliases = ['graph.facebook.com', 'facebook'];
        break;
      case IdentityProvider.GOOGLE:
        aliases = ['accounts.google.com', 'google', 'google-oauth2'];
        break;
    }

    return aliases;
  }

  /**
   * @param {Object} providers
   * @param {String} providerName
   * @param {Object} identityMetadata
   */
  constructor(providers, providerName, identityMetadata) {
    if (Object.keys(providers).indexOf(providerName) === -1) {
      throw new MissingLoginProviderException(providerName);
    }

    if (identityMetadata.hasOwnProperty('provider') &&
      IdentityProvider.ALIASES(providerName).indexOf(identityMetadata.provider) === -1) {
      throw new IdentityProviderMismatchException(providerName, identityMetadata.provider);
    }

    this._providers = providers;
    this._name = providerName;
    this._userToken = identityMetadata.access_token || null;
    this._tokenExpTime = identityMetadata.tokenExpirationTime ? new Date(identityMetadata.tokenExpirationTime) : null;
    this._userId = identityMetadata.user_id || null;
  }

  /**
   * @returns {Object}
   */
  get providers() {
    return this._providers;
  }

  /**
   * @returns {String}
   */
  get name() {
    return this._name;
  }

  /**
   * @returns {String}
   */
  get userToken() {
    return this._userToken;
  }

  /**
   * @returns {Date|null}
   */
  get tokenExpirationTime() {
    return this._tokenExpTime;
  }

  /**
   * @returns {boolean}
   */
  isTokenValid() {
    if (this.userToken && this.tokenExpirationTime) {
      return this.tokenExpirationTime > new Date();
    }

    return false;
  }

  /**
   * @returns {String}
   */
  get userId() {
    return this._userId;
  }

  /**
   * @param {String} name
   * @returns {Object}
   */
  config(name) {
    if (!this.providers.hasOwnProperty(name)) {
      throw new MissingLoginProviderException(name);
    }

    return this.providers[name];
  }
}
