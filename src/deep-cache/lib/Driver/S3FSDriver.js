/**
 * Created by CCristi <ccovali@mitocgroup.com> on 12/10/15.
 */

'use strict';

import {AbstractFsDriver} from './AbstractFsDriver';
import {Exception} from '../Exception/Exception';

/**
 * S3FS Cache Driver
 */
export class S3FSDriver extends AbstractFsDriver {
  /**
   * @param {S3FS} s3fs
   * @param {String} directory
   */
  constructor(s3fs, directory = AbstractFsDriver.DEFAULT_DIRECTORY) {
    super(directory);

    this._fs = s3fs;
  }

  /**
   * @param key
   * @param callback
   * @private
   */
  _has(key, callback = () => {}) {
    this._get(key, (err, data) => {
      callback(err, data !== null);
    });
  }

  /**
   * @param {String} key
   * @param {Function} callback
   * @private
   */
  _get(key, callback = () => {}) {
    this._fs.readFile(key, (err, data) => {
      if (err) {
        return callback(err, null);
      }

      let parsedData = JSON.parse(data);

      if (parsedData.expires && parsedData.expires < AbstractFsDriver._now) {
        return callback(null, null);
      }

      callback(null, parsedData.value);
    });
  }

  /**
   * @param {String} key
   * @param {Object} value
   * @param {Number} ttl
   * @param {Function} callback
   * @private
   */
  _set(key, value, ttl, callback = () => {}) {
    let strObject = JSON.stringify({
      expires: ttl > 0 ? AbstractFsDriver._now + ttl : false,
      value: value
    });

    this._fs.writeFile(key, strObject, (err) => {
      callback(err, null);
    });
  }

  /**
   * @param {String} key
   * @param {Function} callback
   * @private
   */
  _invalidate(key, callback = () => {}) {
    this._fs.unlink(key, callback);
  }
}
