'use strict';


import {RedisMock} from './RedisMock';
import {RedisDriver} from '../../lib.compiled/Driver/RedisDriver';

export class RedisDriverMock extends RedisDriver {
  /**
   * @param args
   */
  constructor(...args) {
    super(args);
    console.log('constructor RedisDriverMock');
    this.isErrorMode = false;
  }

  /**
   * Enables error mode
   */
  enableErrorMode() {
    this.isErrorMode = true;
    this._client.enableError();
  }

  /**
   * Disables error mode
   */
  disableErrorMode() {
    this.isErrorMode = false;
    this._client.disableError();
  }

  /**
   * @constructor
   */
  get NATIVE_DRIVER() {
    return RedisMock;
  }
}
