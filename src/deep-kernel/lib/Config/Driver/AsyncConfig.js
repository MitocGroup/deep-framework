/**
 * Created by AlexanderC on 3/7/16.
 */

'use strict';

import {AbstractDriver} from './AbstractDriver';
import {HttpDriver} from './HttpDriver';
import AWS from 'aws-sdk';

export class AsyncConfig extends AbstractDriver {
  /**
   * @param {String} bucket
   * @param {String} configFile
   */
  constructor(bucket = null, configFile = AsyncConfig.DEFAULT_CONFIG_FILE) {
    super();

    this._bucket = bucket;
    this._configFile = configFile;
  }

  /**
   * @param {Kernel|*} kernel
   */
  static createFromKernel(kernel) {
    return new AsyncConfig(kernel.isBackend ? kernel.get('fs').public.bucket : null);
  }

  /**
   * @returns {String|*}
   */
  get bucket() {
    return this._bucket;
  }

  /**
   * @returns {String|*}
   */
  get configFile() {
    return this._configFile;
  }

  /**
   * @param {String} bucket
   * @param {String} configFile
   * @private
   */
  _load(bucket = null, configFile = null) {
    this._bucket = bucket || this._bucket;
    this._configFile = configFile || this._configFile;

    this._bucket ? this._loadFromS3() : this._loadFromEndpoint();
  }

  /**
   * @private
   */
  _loadFromS3() {
    let payload = {
      Bucket: this._bucket,
      Key: this._configFile,
    };

    AsyncConfig._s3.getObject(payload, (error, data) => {
      if (error) {
        this.fail(`Failed to load s3://${payload.Bucket}/${payload.Key}: ${error}`);

        return;
      }

      this.loadedJson(data.Body.toString());
    });
  }

  /**
   * @private
   */
  _loadFromEndpoint() {
    new HttpDriver(this._configFile)
      .inherit(this)
      .load();
  }

  /**
   * @returns {AWS.S3|*}
   * @private
   */
  static get _s3() {
    return new AWS.S3();
  }

  /**
   * @returns {String}
   */
  static get DEFAULT_CONFIG_FILE() {
    return '_async_config.json';
  }
}
