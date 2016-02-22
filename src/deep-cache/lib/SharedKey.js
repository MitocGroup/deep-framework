/**
 * Created by CCristi <ccovali@mitocgroup.com> on 2/16/16.
 */

'use strict';

/**
 * Shared Key
 */
export class SharedKey {
  /**
   *
   * @param {String} keyString
   * @param {Instance} microservice
   */
  constructor(keyString, microservice) {
    this._key = keyString;
    this._microservice = microservice;
  }

  /**
   * @returns {Instance}
   */
  get microservice() {
    return this._microservice;
  }

  /**
   * @returns {String}
   */
  toString() {
    return this._key;
  }
}
