import backendConfig from './backend-cfg-json';
import frontendConfig from './frontent-cfg-json';
import {Kernel} from '../../lib/Kernel';

export default {
  /**
   * @param {Object} services
   * @param {Function} callback
   */
  create: function(services, callback) {
    let frontendInstance = new Kernel(services, Kernel.FRONTEND_CONTEXT);
    let backendInstance = new Kernel(services, Kernel.BACKEND_CONTEXT);

    return frontendInstance.load(frontendConfig, (frontendKernel) => {
      backendInstance.load(backendConfig, (backendKernel) => {
        callback(frontendKernel, backendKernel);
      });
    });
  },
};
