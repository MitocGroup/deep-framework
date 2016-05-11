'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _backendCfgJson = require('./backend-cfg-json');

var _backendCfgJson2 = _interopRequireDefault(_backendCfgJson);

var _frontentCfgJson = require('./frontent-cfg-json');

var _frontentCfgJson2 = _interopRequireDefault(_frontentCfgJson);

var _deepKernel = require('deep-kernel');

var _deepKernel2 = _interopRequireDefault(_deepKernel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  /**
   * @param {Object} services
   * @param {Function} callback
   */
  create: function create(services, callback) {
    let frontendInstance = new _deepKernel2.default(services, _deepKernel2.default.FRONTEND_CONTEXT);
    let backendInstance = new _deepKernel2.default(services, _deepKernel2.default.BACKEND_CONTEXT);

    return frontendInstance.load(_frontentCfgJson2.default, frontendKernel => {
      backendInstance.load(_backendCfgJson2.default, backendKernel => {
        callback(frontendKernel, backendKernel);
      });
    });
  }
};
module.exports = exports['default'];