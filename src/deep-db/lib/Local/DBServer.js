/**
 * Created by AlexanderC on 9/23/15.
 */

'use strict';

import {LocalDynamo} from './Driver/LocalDynamo';
import {Dynalite} from './Driver/Dynalite';

export class DBServer {
  /**
   * @param {Function|String} driver
   * @param {*} args
   * @returns {Function}
   */
  static create(driver = DBServer.DEFAULT_DRIVER, ...args) {
    let DriverProto = typeof driver === 'string'
      ? DBServer._findDriverPrototype(driver)
      : driver;

    if (!DriverProto) {
      throw new Error(`Missing DB server driver ${driver}`);
    }

    return new DriverProto(...args);
  }

  /**
   * @param {String} name
   * @returns {Function}
   * @private
   */
  static _findDriverPrototype(name) {
    for (let driverProtoKey in DBServer.DRIVERS) {
      if (!DBServer.DRIVERS.hasOwnProperty(driverProtoKey)) {
        continue;
      }

      let driverProto = DBServer.DRIVERS[driverProtoKey];

      if (driverProto.name === name) {
        return driverProto;
      }
    }

    return null;
  }

  /**
   * @returns {Function[]}
   */
  static get DRIVERS() {
    return [
      LocalDynamo,
      Dynalite,
    ];
  }

  /**
   * @returns {Function}
   */
  static get DEFAULT_DRIVER() {
    return DBServer.DRIVERS[0];
  }
}
