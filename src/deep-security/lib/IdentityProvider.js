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

    let normalizedMetadata = this._normalizeIdentityMetadata(providerName, identityMetadata);

    this._metadata = identityMetadata;
    this._userToken = normalizedMetadata.token;
    this._tokenExpTime = new Date(normalizedMetadata.expireTime);
    this._userId = normalizedMetadata.userId;
    this._providers = providers;
    this._name = providerDomain;
  }

  /**
   * @param {String} providerName
   * @param {Object} providers
   * @returns {*}
   */
  getProviderDomain(providerName, providers) {
    let domainRegexp;

    switch(providerName) {
      case IdentityProvider.AMAZON_PROVIDER:
        domainRegexp = /^www\.amazon\.com$/;
        break;
      case IdentityProvider.FACEBOOK_PROVIDER:
        domainRegexp = /^graph\.facebook\.com$/;
        break;
      case IdentityProvider.GOOGLE_PROVIDER:
        domainRegexp = /^accounts\.google\.com$/;
        break;
      case IdentityProvider.AUTH0_PROVIDER:
        domainRegexp = /^.+\.auth0\.com$/;
        break;
      case IdentityProvider.COGNITO_USER_POOL_PROVIDER:
        domainRegexp = /^cognito\-idp\.[\w\d\-]+\.amazonaws\.com\/[\w\d\-]+$/;
        break;
    }

    if (!domainRegexp) {
      return null;
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
   * @todo: Implement other identity providers
   * @param {String} providerName
   * @param {Object} identityMetadata
   * @returns {{token: String, userId: String, expireTime: Number}}
   * @private
   */
  _normalizeIdentityMetadata(providerName, identityMetadata) {
    let token = null;
    let expiresIn  = null;
    let expireTime = null;
    let userId = null;

    switch(providerName) {
      case IdentityProvider.FACEBOOK_PROVIDER:
        token = identityMetadata.accessToken;
        expiresIn = identityMetadata.expiresIn;
        userId = identityMetadata.userID;
        break;

      case IdentityProvider.COGNITO_USER_POOL_PROVIDER:
        let idTokenInstance = identityMetadata.getSignInUserSession().getIdToken();
        token = idTokenInstance.getJwtToken();
        expireTime = idTokenInstance.getExpiration() * 1000;
        break;

      case IdentityProvider.AMAZON_PROVIDER:
        token = identityMetadata.access_token;
        userId = identityMetadata.user_id;
        expiresIn = identityMetadata.expires_in || 3600;
        break;

      case IdentityProvider.AUTH0_PROVIDER:
        expireTime = identityMetadata.tokenExpirationTime;
        token = identityMetadata.access_token;
        userId = identityMetadata.user_id;
        break;
    }

    userId = userId || null;
    expireTime = expireTime ||
      (expiresIn ?
        (Date.now() + expiresIn * 1000) :
        null);

    if (!(token && expireTime)) {
      throw new InvalidProviderIdentityException(providerName);
    }

    return {token, userId, expireTime};
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

  /**
   * @returns {String}
   */
  static get COGNITO_USER_POOL_PROVIDER() {
    return 'cognito-user-pool';
  }

  /**
   * @returns {String}
   */
  static get FACEBOOK_PROVIDER() {
    return 'facebook';
  }

  /**
   * @returns {String}
   */
  static get AMAZON_PROVIDER() {
    return 'amazon';
  }

  /**
   * @returns {String}
   */
  static get GOOGLE_PROVIDER() {
    return 'google';
  }

  /**
   * @returns {String}
   */
  static get AUTH0_PROVIDER() {
    return 'auth0';
  }
}
