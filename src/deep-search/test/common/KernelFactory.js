'use strict';

import backendConfig from './backend-cfg-json';
import Kernel from 'deep-kernel';

export default {
  /**
   * @param {Object} services
   * @param {Function} callback
   */
  create: function(services, callback) {

    let backendInstance = new Kernel(services, Kernel.BACKEND_CONTEXT);

    return backendInstance.load(backendConfig, (backendKernel) => {

      callback(backendKernel);
    });
  },
};
