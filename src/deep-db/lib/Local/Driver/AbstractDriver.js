/**
 * Created by AlexanderC on 9/23/15.
 */

'use strict';

import Core from 'deep-core';
import {ServerAlreadyRunningException} from './Exception/ServerAlreadyRunningException';
import {ServerTtsExceededException} from './Exception/ServerTtsExceededException';

export class AbstractDriver extends Core.OOP.Interface {
  /**
   * @param {Number} port
   */
  constructor(port = AbstractDriver.DEFAULT_PORT) {
    super('_start', '_stop');

    this._running = false;
    this._port = port;
    this._teardownHook = false;
  }

  /**
   * @returns {Number}
   */
  get port() {
    return this._port;
  }

  /**
   * @param {Number} port
   */
  set port(port) {
    this._port = port;
  }

  /**
   * @returns {Boolean}
   */
  get running() {
    return this._running;
  }

  /**
   * @returns {AbstractDriver}
   * @private
   */
  _registerTeardownHook() {
    if (this._teardownHook) {
      return this;
    }

    this._teardownHook = true;

    process.once('uncaughtException', (error) => {
      this.stop(() => '');

      throw error;
    });

    process.once('exit', () => {
      this.stop(() => '');
    });

    return this;
  }

  /**
   * @todo: better way to control the timeout of server startup...
   *
   * @param {Number} tts
   * @param {Function} cb
   * @private
   */
  _triggerOnTtsExpired(tts, cb) {
    setTimeout(() => {
      if (!this._running) {
        cb();
      }
    }, tts * 1000);
  }

  /**
   * @param {Function} cb
   * @param {Number} tts
   * @returns {AbstractDriver}
   */
  start(cb, tts = AbstractDriver.DEFAULT_TTS) {
    if (this._running) {
      cb(new ServerAlreadyRunningException(this));

      return this;
    }

    let _cbTriggered = false;

    this._start((error, ...args) => {
      _cbTriggered = true;

      if (!error) {
        this._running = true;
        this._registerTeardownHook();
      }

      cb(error, ...args);
    });

    this._triggerOnTtsExpired(tts, () => {
      if (!_cbTriggered) {
        _cbTriggered = true;

        cb(new ServerTtsExceededException(this, tts));
      }
    });

    return this;
  }

  /**
   * @param {Function} cb
   * @returns {AbstractDriver}
   */
  stop(cb) {
    if (!this._running) {
      cb(null);

      return this;
    }

    this._stop((error, ...args) => {
      if (!error) {
        this._running = false;
      }

      cb(error, ...args);
    });

    return this;
  }

  /**
   * @param {Function} cb
   * @returns {AbstractDriver}
   */
  restart(cb) {
    this.stop((error) => {
      if (error) {
        cb(error);

        return;
      }

      this.start(cb);
    });

    return this;
  }

  /**
   * @returns {Number}
   */
  static get DEFAULT_TTS() {
    return 10;
  }

  /**
   * @returns {Number}
   */
  static get DEFAULT_PORT() {
    return 8877;
  }
}
