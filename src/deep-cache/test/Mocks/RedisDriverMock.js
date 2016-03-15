'use strict';


import {RedisMock} from './RedisMock';
import {RedisDriver} from '../../lib/Driver/RedisDriver';

export class RedisDriverMock extends RedisDriver {
  /**
   * @param args
   */
  constructor(...args) {
    super(args);
    this.disableFailureMode();
  }

  /**
   * @param {String} dsn
   * @private
   */
  _autoDiscover(dsn) {
    this._client = new this.NATIVE_DRIVER(dsn);
  }

  /**
   * Enables failure mode
   */
  enableFailureMode() {
    this.isFailureEnabled = true;
    this._client.enableFailureMode();
  }

  /**
   * Disables failure mode
   */
  disableFailureMode() {
    this.isFailureEnabled = false;
    this._client.disableFailureMode();
  }

  /**
   * @constructor
   */
  get NATIVE_DRIVER() {
    return RedisMock;
  }
}
