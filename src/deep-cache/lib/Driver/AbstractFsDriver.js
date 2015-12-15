/**
 * Created by CCristi <ccovali@mitocgroup.com> on 12/11/15.
 */

'use strict';

import {AbstractDriver} from './AbstractDriver';
import crypto from 'crypto';

/**
 * Abstract FileSystem Driver
 */
export class AbstractFsDriver extends AbstractDriver {
  /**
   * @returns {String}
   */
  static get DEFAULT_DIRECTORY() {
    return '__cache__';
  }

  /**
   * @param directory
   */
  constructor(directory = AbstractFsDriver.DEFAULT_DIRECTORY) {
    super();

    this._directory = directory;
  }

  /**
   * @param {String} key
   * @private
   */
  _buildKey(key) {
    return `${this._directory}/${AbstractFsDriver._hash(key, 'sha1')}` +
           `|${AbstractFsDriver._hash(key, 'md5')}.${this._buildId}`;
  }

  /**
   * @param {String} text
   * @param {String} alg
   * @returns {String}
   * @private
   */
  static _hash(text, alg) {
    return crypto.createHash(alg).update(text).digest('hex');
  }

  /**
   * @returns {Number}
   */
  static get _now() {
    return parseInt(new Date().getTime() / 1000);
  }
}
