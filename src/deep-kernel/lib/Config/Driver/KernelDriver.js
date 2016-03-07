/**
 * Created by AlexanderC on 3/7/16.
 */

'use strict';

import {AbstractDriver} from './AbstractDriver';
import {ComplexDriver} from './ComplexDriver';
import {ScopeDriver} from './ScopeDriver';
import {FsDriver} from './FsDriver';
import {HttpDriver} from './HttpDriver';

export class KernelDriver extends AbstractDriver {
  /**
   * @param {Kernel|*} kernel
   * @param {String} scopeKey
   * @param {String} configFile
   */
  constructor(kernel, scopeKey = KernelDriver.SCOPE_KEY, configFile = KernelDriver.DEFAULT_CONFIG_FILE) {
    super();

    this._kernel = kernel;
    this._scopeKey = scopeKey;
    this._configFile = configFile;
  }

  /**
   * @returns {String|*}
   */
  get scopeKey() {
    return this._scopeKey;
  }

  /**
   * @returns {String|*}
   */
  get configFile() {
    return this._configFile;
  }

  /**
   * @returns {Kernel|*}
   */
  get kernel() {
    return this._kernel;
  }

  /**
   * @param {String} scopeKey
   * @param {String} configFile
   * @private
   */
  _load(scopeKey = null, configFile = null) {
    this._scopeKey = scopeKey || this._scopeKey;
    this._configFile = configFile || this._configFile;

    new ComplexDriver()
      .inherit(this)
      .add((new ScopeDriver(this._scopeKey)).setScope(this._globalScope))
      .add(this._kernel.isBackend ? new FsDriver(this._configFile) : new HttpDriver(this._configFile))
      .load();
  }

  /**
   * @returns {Object}
   * @private
   */
  get _globalScope() {
    return this._kernel.isBackend ? global : window || {};
  }

  /**
   * @returns {String}
   */
  static get SCOPE_KEY() {
    return '__DEEP_CFG__';
  }

  /**
   * @returns {String}
   */
  static get DEFAULT_CONFIG_FILE() {
    return '_config.json';
  }
}
