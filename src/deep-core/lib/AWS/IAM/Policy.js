/**
 * Created by AlexanderC on 5/27/15.
 */

'use strict';

import {Extractable} from './Extractable';
import {Collection} from './Collection';
import {Statement} from './Statement';

/**
 * IAM policy
 */
export class Policy extends Extractable {
  constructor() {
    super();

    this._version = Policy.DEFAULT_VERSION;
    this._statement = new Collection(Statement);
  }

  /**
   * @returns {String}
   */
  static get ANY() {
    return '*';
  }

  /**
   * @returns {String}
   */
  static get DEFAULT_VERSION() {
    return '2012-10-17';
  }

  /**
   * @param {String} version
   */
  set version(version) {
    this._version = version;
  }

  /**
   * @returns {String}
   */
  get version() {
    return this._version;
  }

  /**
   * @returns {Collection}
   */
  get statement() {
    return this._statement;
  }

  /**
   * @return {Object}
   */
  extract() {
    return {
      Version: this._version,
      Statement: this._statement.extract(),
    };
  }

  /**
   * @return {String}
   */
  toString() {
    return JSON.stringify(this.extract());
  }
}
