/**
 * Created by AlexanderC on 3/7/16.
 */

'use strict';

import {AbstractDriver} from './AbstractDriver';
import {HttpDriver} from './HttpDriver';
import {FsDriver} from './FsDriver';

export class AsyncConfig extends AbstractDriver {
  /**
   * @param {Kernel|*} kernel
   * @param {String} configFile
   */
  constructor(kernel, configFile = AsyncConfig.DEFAULT_CONFIG_FILE) {
    super();

    this._kernel = kernel;
    this._configFile = configFile;
  }

  /**
   * @returns {Kernel|*}
   */
  get kernel() {
    return this._kernel;
  }

  /**
   * @returns {String|*}
   */
  get configFile() {
    return this._configFile;
  }

  /**
   * @param {String} configFile
   * @private
   */
  _load(configFile = null) {
    this._configFile = configFile || this._configFile;

    this._kernel.isBackend ? this._loadFromFS() : this._loadFromEndpoint();
  }

  /**
   * @private
   */
  _loadFromFS() {
    let sharedFs = this._kernel.get('fs')
      .shared(this._kernel.rootMicroservice.identifier);

    new FsDriver(this._configFile)
      .setFs(sharedFs)
      .inherit(this)
      .load();
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
   * @returns {String}
   */
  static get DEFAULT_CONFIG_FILE() {
    return '_async_config.json';
  }
}
