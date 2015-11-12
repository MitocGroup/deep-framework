/**
 * Created by mgoria on 11/12/15.
 */

'use strict';

import {MissingLoginProviderException} from './Exception/MissingLoginProviderException';

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
   * @param {Object} providers
   * @param {String} providerName
   * @param {String} userToken
   * @param {String} userId
   */
  constructor(providers, providerName, userToken, userId) {
    if (Object.keys(providers).indexOf(providerName) === -1) {
      throw new MissingLoginProviderException(providerName);
    }

    this._providers = providers;
    this._name = providerName;
    this._userToken = userToken;
    this._userId = userId;
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
    if (Object.keys(this.providers).indexOf(name) === -1) {
      throw new MissingLoginProviderException(name);
    }

    return this.providers[name];
  }
}
