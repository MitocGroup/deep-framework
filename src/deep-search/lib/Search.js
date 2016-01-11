/**
 * Created by mgoria on 5/28/15.
 */

'use strict';

import Kernel from 'deep-kernel';

export class Search extends Kernel.ContainerAware {
  constructor() {
    super();
  }

  /**
   * Booting a certain service
   *
   * @param {Kernel} kernel
   * @param {Function} callback
   */
  boot(kernel, callback) {

    callback();
  }
}
