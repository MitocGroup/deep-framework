/**
 * Created by CCristi <ccovali@mitocgroup.com> on 12/10/15.
 */

'use strict';

import {AbstractFsDriver} from './AbstractFsDriver';

/**
 * S3FS Cache Driver
 */
export class S3FSDriver extends AbstractFsDriver {
  /**
   * @param {ContainerAware} containerAware
   * @param {String} directory
   */
  constructor(containerAware, directory = AbstractFsDriver.DEFAULT_DIRECTORY) {
    super(directory);

    this._containerAware = containerAware;
  }

  /**
   * @param {String} key
   * @param {Function} callback
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
        callback(err, null);

        return;
      }

      try {
        var parsedData = JSON.parse(data);

        if (parsedData.expires && parsedData.expires < AbstractFsDriver._now || parsedData.buildId !== this._buildId) {
          this._invalidate(key);

          callback(null, null);

          return;
        }

        callback(null, parsedData.value);
      } catch (e) { // avoid parse error on missing or broken object in S3
        this._invalidate(key);

        callback(null, null);
      }
    });
  }

  /**
   * @param {String} key
   * @param {Object} value
   * @param {Number} ttl
   * @param {Function} callback
   * @private
   */
  _set(key, value, ttl = 0, callback = () => {}) {
    let strObject = JSON.stringify({
      expires: ttl > 0 ? AbstractFsDriver._now + ttl : null,
      value: value,
      buildId: this._buildId,
    });

    this._fs.mkdirp(this._directory, () => {
      this._fs.writeFile(key, strObject, (err) => {
        callback(err, !err);
      });
    });
  }

  /**
   * @param {String} key
   * @param {Number} timeout
   * @param {Function} callback
   * @private
   */
  _invalidate(key, timeout = 0, callback = () => {}) {
    if (timeout <= 0) {
      this._fs.unlink(key, (err) => {
        callback(err, !err);
      });

      return;
    }

    this._get(key, (err, data) => {
      if (err) {
        callback(err, null);

        return;
      }

      this._set(key, data.value, timeout, callback);
    });
  }

  /**
   * @returns {s3fs}
   * @private
   */
  get _fs() {
    return this._containerAware.container.get('fs').public;
  }
}
