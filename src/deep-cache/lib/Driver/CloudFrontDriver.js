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
    this._asset = containerAware.container.get('asset');
  }

  /**
   * @param {String} key
   * @param {Function} callback
   * @private
   */
  _has(key, callback = () => {}) {
    this._request(key, (err, data) => {
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
   * @param {Function} callback
   * @private
   */
  _set(key, value, callback = () => {}) {
    throw new MethodNotAvailableException('set');
  }

  /**
   * @param {String} key
   * @param {Function} callback
   * @private
   */
  _invalidate(key, callback = () => {}) {
    throw new MethodNotAvailableException('invalidate');
  }

  /**
   * @param {String} key
   * @returns {String}
   * @private
   */
  _buildKey(key) {
    let microservice = this._containerAware.microservice;

    return this._asset.locate(`@${microservice}:${super._buildKey(key)}`);
  }

  /**
   * @param {String} url
   * @param {Function} callback
   * @private
   */
  _request(url, callback) {
    var client = new XMLHttpRequest();

    client.onreadystatechange = function() {
      if (client.readyState == 4) {
        if (client.status != 200) {
          return callback(client.statusText, null);
        }

        callback(null, client.responseText);
      }
    };

    client.open('GET', url);
    client.send();
  }
}
