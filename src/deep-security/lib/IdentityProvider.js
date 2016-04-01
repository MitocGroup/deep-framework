/**
 * Created by mgoria on 11/12/15.
 */

'use strict';

import {MissingLoginProviderException} from './Exception/MissingLoginProviderException';
import {IdentityProviderMismatchException} from './Exception/IdentityProviderMismatchException';
import {InvalidProviderIdentityException} from './Exception/InvalidProviderIdentityException';

/**
 * 3rd Party identity provider (Amazon, Facebook, Google, etc.)
 */
export class IdentityProvider {
  /**
   * @param providerName
   * @param providers
   * @returns {*}
   */
  getProviderDomain(providerName, providers) {
    let domainRegexp;

    switch(providerName) {
      case 'amazon':
        domainRegexp = /^www\.amazon\.com$/;
        break;
      case 'facebook':
        domainRegexp = /^graph\.facebook\.com$/;
        break;
      case 'google':
        domainRegexp = /^accounts\.google\.com$/;
        break;
      case 'auth0':
        domainRegexp = /^.+\.auth0\.com$/;
        break;
    }

    for (let providerDomain in providers) {
      if (!providers.hasOwnProperty(providerDomain)) {
        continue;
      }

      if (domainRegexp.test(providerDomain)) {
        return providerDomain;
      }
    }

    return null;
  }

  /**
   * @param {Object} providers
   * @param {String} providerName
   * @param {Object} identityMetadata
   */
  constructor(providers, providerName, identityMetadata) {
    let providerDomain = this.getProviderDomain(providerName, providers);

    if (!providerDomain) {
      throw new MissingLoginProviderException(providerName);
    }

    if (identityMetadata.provider && identityMetadata.provider !== providerName) {
      throw new IdentityProviderMismatchException(providerName, identityMetadata.provider);
    }

    if (!identityMetadata.access_token || !identityMetadata.tokenExpirationTime) {
      throw new InvalidProviderIdentityException(providerName);
    }

    this._providers = providers;
    this._name = providerDomain;
    this._userToken = identityMetadata.access_token;
    this._tokenExpTime = new Date(identityMetadata.tokenExpirationTime);
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
   * @returns {Date}
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
