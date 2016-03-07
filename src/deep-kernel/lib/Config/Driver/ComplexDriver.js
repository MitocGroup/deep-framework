/**
 * Created by AlexanderC on 3/7/16.
 */

'use strict';

import {AbstractDriver} from './AbstractDriver';

export class ComplexDriver extends AbstractDriver {
  /**
   * @param {AbstractDriver|*} drivers
   */
  constructor(...drivers) {
    super();

    this._drivers = drivers;
  }

  /**
   * @returns {AbstractDriver[]|*[]|*}
   */
  get drivers() {
    return this._drivers;
  }

  /**
   * @param {AbstractDriver|*} driver
   * @returns {ComplexDriver}
   */
  add(driver) {
    this._drivers.push(driver);

    return this;
  }

  /**
   * @param {AbstractDriver|*} mainDriver
   * @returns {ComplexDriver}
   */
  inherit(mainDriver) {
    this.onLoadedCb(mainDriver.onLoaded);
    this.onFailCb(mainDriver.onFail);

    return this;
  }

  /**
   * @private
   */
  _load(...drivers) {
    this._drivers = this._drivers.concat(drivers);

    this._loadDriversQueue([].concat(this._drivers));
  }

  /**
   * @param {AbstractDriver[]|*[]} drivers
   * @param {Error[]|String[]|*[]} errors
   * @private
   */
  _loadDriversQueue(drivers, errors = []) {
    if (drivers.length <= 0) {
      this.fail(`All drivers failed to load: ${errors.join('; ')}`);

      return;
    }

    let driver = drivers.shift();

    driver.onLoadedCb((config) => {
      this.loaded(config);
    });

    driver.onFailCb((error) => {
      errors.push(error.toString());

      this._loadDriversQueue(drivers, errors);
    });

    driver.load();
  }
}
