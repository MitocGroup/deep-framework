/**
 * Created by CCristi <ccovali@mitocgroup.com> on 12/10/15.
 */

'use strict';

import {AbstractFsDriver} from './AbstractFsDriver';
import {MethodNotAvailableException} from '../Exception/MethodNotAvailableException';
import {Exception} from '../Exception/Exception';

/**
 * CloudFront Cache Driver
 */
export class CloudFrontDriver extends AbstractFsDriver {

  /**
   * @todo: Find better way to extract the working microservice identifier
   *
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
    this._request(key, (err, data) => {
      if (err) {
        return callback(err, null);
      }

      try {
        let parsedData = JSON.parse(data);

        if (parsedData.expires && parsedData.expires < AbstractFsDriver._now) {
          throw new Exception('Expired');
        }

        callback(null, parsedData.value);
      } catch (e) {
        // @todo: Find a way to invalidate broken or expired keys
        callback(null, null);
      }
    });
  }

  /**
   * Throw MethodNotAvailableException
   *
   * @private
   */
  _set() {
    throw new MethodNotAvailableException('set');
  }

  /**
   * Throw MethodNotAvailableException
   *
   * @private
   */
  _invalidate() {
    throw new MethodNotAvailableException('invalidate');
  }

  /**
   * @param {String} key
   * @returns {String}
   * @private
   */
  _buildKey(key) {
    return this._asset.locate(`@${this._microservice}:${super._buildKey(key)}`);
  }

  /**
   * @param {String} url
   * @param {Function} callback
   * @private
   */
  _request(url, callback) {
    var client = new XMLHttpRequest();

    client.onreadystatechange = function() {
      if (client.readyState === 4) {
        if (client.status !== 200) {
          return callback(client.statusText, null);
        }

        callback(null, client.responseText);
      }
    };

    client.open('GET', url);
    client.send();
  }

  /**
   * Returns the microservice binded to `resource` service
   *
   * @returns {Instance}
   * @private
   */
  get _microservice() {
    return this._containerAware.container.get('resource').microservice;
  }

  /**
   * @returns {Asset}
   * @private
   */
  get _asset() {
    return this._containerAware.container.get('asset');
  }
}
