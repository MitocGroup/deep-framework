'use strict';


import {RedisMock} from './RedisMock';
import {RedisDriver} from '../../lib.compiled/Driver/RedisDriver';

export class RedisDriverMock extends RedisDriver {
  /**
   * @param args
   */
  constructor(...args) {
    super(args);
    this.disableFailureMode();
  }

  /**
   * Enables error mode
   */
  enableFailureMode() {
    this.isFailureEnabled = true;
    this._client.enableFailureMode();
  }

  /**
   * Disables error mode
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
