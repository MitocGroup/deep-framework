/**
 * Created by mgoria on 5/28/15.
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Asset = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _deepKernel = require('deep-kernel');

var _deepKernel2 = _interopRequireDefault(_deepKernel);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @temp Asset class definition
 */

let Asset = exports.Asset = function (_Kernel$ContainerAwar) {
  _inherits(Asset, _Kernel$ContainerAwar);

  function Asset() {
    _classCallCheck(this, Asset);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Asset).call(this));

    _this._injectBuildId = Asset.INJECT_BUILD_ID_STATE;
    _this._buildId = null;
    return _this;
  }

  /**
   * @returns {Boolean}
   */


  _createClass(Asset, [{
    key: 'boot',


    /**
     * Booting a certain service
     *
     * @param {Kernel} kernel
     * @param {Function} callback
     */
    value: function boot(kernel, callback) {
      this._buildId = kernel.buildId;

      if (kernel.isFrontend) {
        let loadVector = [];
        let microservices = kernel.microservices;

        for (let microserviceKey in microservices) {
          if (!microservices.hasOwnProperty(microserviceKey)) {
            continue;
          }

          let microservice = microservices[microserviceKey];

          if (microservice.isRoot) {
            continue;
          }

          loadVector.push(this.locate(`@${ microservice.identifier }:bootstrap.js`));
        }

        kernel.container.addParameter(_deepKernel2.default.FRONTEND_BOOTSTRAP_VECTOR, loadVector);
      }

      callback();
    }

    /**
     * @param {String} assetIdentifier (e.g. @microservice_identifier:asset_path)
     * @param {String} suffix
     * @returns {String}
     */

  }, {
    key: 'locate',
    value: function locate(assetIdentifier) {
      let suffix = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
      let skipVersioning = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

      let path = this._resolveIdentifier(assetIdentifier);

      let basePath = this.microservice.isRoot ? _path2.default.join(path) : _path2.default.join(this.microservice.toString(), path);

      let internalSuffix = this._injectBuildId && this._buildId && !skipVersioning ? `?_v=${ this._buildId }` : '';

      return `${ basePath }${ suffix }${ internalSuffix }`;
    }

    /**
     * @param {String} assetIdentifier (e.g. @microservice_identifier:asset_path)
     * @param {String} suffix
     * @returns {String}
     */

  }, {
    key: 'locateAbsolute',
    value: function locateAbsolute() {
      return Asset._baseUrl + _path2.default.join('/', this.locate.apply(this, arguments));
    }

    /**
     * @returns {String}
     */

  }, {
    key: 'injectBuildId',
    get: function get() {
      return this._injectBuildId;
    }

    /**
     * @param {Boolean} state
     */
    ,
    set: function set(state) {
      this._injectBuildId = state;
    }
  }], [{
    key: '_baseUrl',
    get: function get() {
      if (!window || !window.location) {
        return '';
      }

      let loc = window.location;

      return loc.origin || `${ loc.protocol }://${ loc.hostname }${ loc.port ? ':' + loc.port : '' }`;
    }

    /**
     * @returns {Boolean}
     */

  }, {
    key: 'INJECT_BUILD_ID_STATE',
    get: function get() {
      return true;
    }
  }]);

  return Asset;
}(_deepKernel2.default.ContainerAware);