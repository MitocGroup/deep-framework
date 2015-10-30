import backendConfig from "./backend-cfg-json";
import frontendConfig from "./frontent-cfg-json";
import Kernel from 'deep-kernel';

export default {
  /**
   * @param {Object} services
   * @param {Function} callback
   */
  create: function(services, callback, done) {
    //let frontendInstance = new Kernel(services, Kernel.FRONTEND_CONTEXT);
    let backendInstance = new Kernel(services, Kernel.BACKEND_CONTEXT);

    //backendInstance.loadFromFile('./test/common/backend.cfg.json', (backendKernel) => {
    //  callback(backendKernel);
    //});

    //return frontendInstance.load(frontendConfig, (frontendKernel) => {
      return backendInstance.load(backendConfig, (backendKernel) => {
        //callback(frontendKernel, backendKernel);
        done();
        callback(backendKernel);
      });
    //});
  },
}
