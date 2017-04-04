/**
 * Created by mgoria on 11/12/15.
 */

'use strict';

import {MissingLoginProviderException} from './Exception/MissingLoginProviderException';
import {IdentityProviderMismatchException} from './Exception/IdentityProviderMismatchException';
import {InvalidProviderIdentityException} from './Exception/InvalidProviderIdentityException';
import {MissingRefreshTokenException} from './Exception/MissingRefreshTokenException';

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

    if (identityMetadata.provider
      && identityMetadata.provider !== providerName
      && providerName !== IdentityProvider.BACKEND_PROVIDER) {

      throw new IdentityProviderMismatchException(providerName, identityMetadata.provider);
    }

    let normalizedMetadata = this._normalizeIdentityMetadata(providerName, identityMetadata);

    this._metadata = identityMetadata;
    this._userToken = normalizedMetadata.token;
    this._tokenExpTime = new Date(normalizedMetadata.expireTime);
    this._userId = normalizedMetadata.userId;
    this._providers = providers;
    this._refreshToken = normalizedMetadata.refreshToken;
    this._domain = providerDomain;
    this._name = providerName;
  }

  /**
   * @param {Object} metadata
   * @returns {IdentityProvider}
   */
  static createBackendProvider(metadata) {
    let provider = new IdentityProvider(null, IdentityProvider.BACKEND_PROVIDER, metadata);

    provider.name = metadata.name;

    return provider;
  }

  /**
   * @param {String} name
   */
  set name(name) {
    this._name = name;
  }

  /**
   * @param {String} providerName
   * @param {Object} providers
   * @returns {*}
   */
  static getProviderDomain(providerName, providers) {
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
      case IdentityProvider.BACKEND_PROVIDER:
        return IdentityProvider.BACKEND_PROVIDER;
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
    let refreshToken = null;

    switch(providerName) {
      case IdentityProvider.FACEBOOK_PROVIDER:
        token = identityMetadata.accessToken;
        expiresIn = identityMetadata.expiresIn;
        userId = identityMetadata.userID;
        break;

      case IdentityProvider.COGNITO_USER_POOL_PROVIDER:
        let userSession = identityMetadata.getSignInUserSession();
        let idTokenInstance = userSession.getIdToken();
        refreshToken = userSession.getRefreshToken().getToken();
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

      // backend identity provider has the same structure as normalized metadata. see `toJSON` method
      case IdentityProvider.BACKEND_PROVIDER:
        return identityMetadata;
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

    return {token, userId, expireTime, refreshToken};
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
  get domain() {
    return this._domain;
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
   * @returns {String}
   */
  get refreshToken() {
    return this._refreshToken;
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
   * @param {Object} idpSnapshot
   * 
   * @returns {IdentityProvider}
   */
  fillFromSnapshot(idpSnapshot) {
    this._refreshToken = idpSnapshot.refreshToken;

    return this;
  }

  /**
   * return normalizedMetadata compatible structure, see `_normalizeIdentityMetadata` method
   * @returns {{name: *, refreshToken: *}}
   */
  toJSON() {
    return {
      token: this._userToken,
      expireTime: this._tokenExpTime,
      userId: this._userId,
      refreshToken: this._refreshToken,
      name: this._name,
    };
  }

  /**
   * @returns {Promise}
   */
  refresh() {
    if (!this._refreshToken) {
      return Promise.reject(new MissingRefreshTokenException());
    }

    switch (this._name) {
      case IdentityProvider.COGNITO_USER_POOL_PROVIDER:
        
    }
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

  /**
   * @returns {String}
   */
  static get BACKEND_PROVIDER() {
    return 'backend';
  }
}
