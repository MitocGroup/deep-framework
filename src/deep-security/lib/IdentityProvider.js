/**
 * Created by mgoria on 11/12/15.
 */

'use strict';

import {MissingLoginProviderException} from './Exception/MissingLoginProviderException';
import {IdentityProviderMismatchException} from './Exception/IdentityProviderMismatchException';
import {InvalidProviderIdentityException} from './Exception/InvalidProviderIdentityException';
import {MissingIdentityImplementationException} from './Exception/MissingIdentityImplementationException';
import {UserPoolImplementation} from './IdentityImplementation/UserPoolImplementation';
import {MissingRefreshTokenException} from './Exception/MissingRefreshTokenException';

/**
 * @todo: split identity providers implementations
 * 
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
      && providerName !== IdentityProvider.SNAPSHOT_PROVIDER) {

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
    this._clientName = normalizedMetadata.clientName;
    this._name = providerName;
  }

  /**
   * @param {Object} metadata
   * @returns {IdentityProvider}
   */
  static createFromSnapshot(metadata) {
    let provider = new IdentityProvider(null, IdentityProvider.SNAPSHOT_PROVIDER, metadata);

    provider.fillFromSnapshot(metadata);

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
      case IdentityProvider.SNAPSHOT_PROVIDER:
        return IdentityProvider.SNAPSHOT_PROVIDER;
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
    let clientName = null;

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
        clientName = identityMetadata.pool.getClientId();
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
      case IdentityProvider.SNAPSHOT_PROVIDER:
        return identityMetadata;
    }

    userId = userId || null;
    expireTime = expireTime ||
      (expiresIn ?
        (Date.now() + expiresIn * 1000) :
        null);

    if (!(token && expireTime)) {
      throw new InvalidProviderIdentityException(providerName);
    }

    return {token, userId, expireTime, refreshToken, clientName};
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
   * @param {String} userToken
   */
  set userToken(userToken) {
    this._userToken = userToken;
  }

  /**
   * @returns {Date}
   */
  get tokenExpirationTime() {
    return this._tokenExpTime;
  }

  /**
   * @param {Date} tokenExpirationTime
   */
  set tokenExpirationTime(tokenExpirationTime) {
    this._tokenExpTime = tokenExpirationTime instanceof Date ? tokenExpirationTime : new Date(tokenExpirationTime);
  }

  /**
   * @returns {String}
   */
  get refreshToken() {
    return this._refreshToken;
  }

  /**
   * @returns {String}
   */
  get clientName() {
    return this._clientName;
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
    this._name = idpSnapshot.name;
    this._refreshToken = idpSnapshot.refreshToken;
    this._clientName = idpSnapshot.clientName;
    this._userToken = idpSnapshot.token;
    this._tokenExpTime = new Date(idpSnapshot.expireTime);

    return this;
  }

  /**
   * return normalizedMetadata compatible structure, see `_normalizeIdentityMetadata` method
   * @returns {{name: *, refreshToken: *}}
   */
  toJSON() {
    return {
      token: this._userToken,
      expireTime: this._tokenExpTime.getTime(),
      userId: this._userId,
      refreshToken: this._refreshToken,
      name: this._name,
      clientName: this._clientName,
    };
  }

  /**
   * @returns {Promise}
   */
  refresh() {
    if (!this._refreshToken) {
      return Promise.reject(new MissingRefreshTokenException());
    }

    let implementation = null;

    switch (this._name) {
      case IdentityProvider.COGNITO_USER_POOL_PROVIDER:
        implementation = new UserPoolImplementation(this);
        break;
      default:
        throw new MissingIdentityImplementationException(this._name);
    }

    return implementation.refreshIdentity();
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
  static get SNAPSHOT_PROVIDER() {
    return 'snapshot';
  }
}
