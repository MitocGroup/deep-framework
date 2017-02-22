/**
 * Created by AlexanderC on 6/15/15.
 */

'use strict';

import Kernel from 'deep-kernel';
import {ConsoleDriver} from './Driver/ConsoleDriver';
import {KinesisDriver} from './Driver/KinesisDriver';

/**
 * Event manager
 */
export class Event extends Kernel.ContainerAware {
  /**
   * @param {Object} drivers
   */
  constructor(drivers = {}) {
    super();

    this._driver = null;
  }
  
  /**
   * @returns {ConsoleDriver|KinesisDriver|*}
   */
  get driver() {
    return this._driver;
  }
  
  /**
   * @param {*} args
   *
   * @returns {Promise|*}
   */
  log(...args) {
    return this.driver.log(...args);
  }

  /**
   * @param {String} kinesisStreamArn
   *
   * @returns {Event|*}
   */
  ensureKinesisDriver(kinesisStreamArn = null) {
    if (this._driver && this._driver instanceof KinesisDriver) {
      return this;
    }
    
    kinesisStreamArn = kinesisStreamArn 
      || this.kernel.config.globals.kinesisEventStream;
      
    this._driver = new KinesisDriver(
      kinesisStreamArn, 
      this._driver.context
    );
    
    return this;
  }

  /**
   * Booting a certain service
   *
   * @param {Kernel} kernel
   * @param {Function} callback
   */
  boot(kernel, callback) {
    const kinesisStreamArn = kernel.config
      .globals.kinesisEventStream;
      
    const contextName = kernel.isFrontend ? 'Frontend' : 'Backend';
    const context = require(`./Context/${contextName}Context`)
      [`${contextName}Context`].fromKernel(kernel);

    if (kernel.env !== Kernel.PROD_ENVIRONMENT || !kinesisStreamArn) {
      this._driver = new ConsoleDriver(context);
    } else {
      this._driver = new KinesisDriver(kinesisStreamArn, context);
    }

    callback();
  }
}
