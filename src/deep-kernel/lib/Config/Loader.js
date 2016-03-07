/**
 * Created by AlexanderC on 3/7/16.
 */

'use strict';

import {KernelDriver} from './Driver/KernelDriver';

export class Loader {
  /**
   * @param {AbstractDriver|FsDriver|HttpDriver|KernelDriver|ComplexDriver|*} driver
   */
  constructor(driver = null) {
    this._driver = driver;
  }

  /**
   * @param {Kernel|*} kernel
   */
  static kernelLoader(kernel) {
    return new Loader(new KernelDriver(kernel));
  }

  /**
   * @returns {AbstractDriver|FsDriver|HttpDriver|KernelDriver|ComplexDriver|*}
   */
  get driver() {
    return this._driver;
  }

  /**
   * @param {AbstractDriver|FsDriver|HttpDriver|KernelDriver|ComplexDriver|*} driver
   * @returns {Loader}
   */
  setDriver(driver) {
    this._driver = driver;

    return this;
  }

  /**
   * @param {Function} onLoaded
   * @param {Function} onFail
   */
  load(onLoaded = null, onFail = null) {
    onLoaded && this._driver.onLoadedCb(onLoaded);
    onFail && this._driver.onFailCb(onFail);

    this._driver.load();
  }
}
