/**
 * Created by AlexanderC on 3/7/16.
 */

'use strict';

import {AbstractDriver} from './AbstractDriver';

export class ScopeDriver extends AbstractDriver {
  /**
   * @param {String} key
   */
  constructor(key) {
    super();

    this._scope = global || {};
    this._key = key;
  }

  /**
   * @returns {Object|*}
   */
  get scope() {
    return this._scope;
  }

  /**
   * @param {Object} scope
   * @returns {ScopeDriver}
   */
  setScope(scope) {
    this._scope = scope;

    return this;
  }

  /**
   * @returns {String}
   */
  get key() {
    return this._key;
  }

  /**
   * @param {String} key
   * @returns {ScopeDriver}
   */
  setKey(key) {
    this._key = key;

    return this;
  }

  /**
   * @param {String} key
   * @private
   */
  _load(key = null) {
    this._key = key || this._key;

    this._scope.hasOwnProperty(this._key) ?
      this.loaded(this._scope[this._key]) :
      this.fail(`Unable to load configuration from scope: No such key '${this._key}' exists`);
  }
}
