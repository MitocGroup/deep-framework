/**
 * Created by AlexanderC on 3/7/16.
 */

'use strict';

import Core from 'deep-core';
import {Exception} from '../../Exception/Exception';

export class AbstractDriver extends Core.OOP.Interface {
  constructor() {
    super([
      '_load'
    ]);

    this._onLoaded = () => {};
    this._onFail = () => {};
  }

  /**
   * @param {*} args
   * @returns {AbstractDriver|FsDriver|HttpDriver|KernelDriver|ComplexDriver|*}
   */
  load(...args) {
    new Core.Runtime.Sandbox(() => {
      this._load(...args);
    })
      .fail(this.fail)
      .run();

    return this;
  }

  /**
   * @param {String} rawConfig
   * @returns {AbstractDriver}
   */
  loadedJson(rawConfig) {
    let config = null;

    try {
      config = JSON.parse(rawConfig);
    } catch (error) {
      return this.fail(`Failed to parse config from ${this._endpoint}: ${error}`);
    }

    return this.loaded(config);
  }

  /**
   * @param {*} config
   * @returns {AbstractDriver}
   */
  loaded(config) {
    this._onLoaded(config);

    return this;
  }

  /**
   * @param {Error|*} error
   * @returns {AbstractDriver}
   */
  fail(error) {
    this._onFail(typeof error === 'string' ? new Exception(error) : error);

    return this;
  }

  /**
   * @returns {Function|*}
   */
  get onLoaded() {
    return this._onLoaded;
  }

  /**
   * @param {Function} cb
   * @returns {AbstractDriver}
   */
  onLoadedCb(cb) {
    this._onLoaded = cb;

    return this;
  }

  /**
   * @returns {Function|*}
   */
  get onFail() {
    return this._onFail;
  }

  /**
   * @param {Function} cb
   * @returns {AbstractDriver}
   */
  onFailCb(cb) {
    this._onFail = cb;

    return this;
  }
}
