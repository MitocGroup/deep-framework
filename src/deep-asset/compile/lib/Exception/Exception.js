/**
 * Created by AlexanderC on 6/10/15.
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Exception = undefined;

var _deepCore = require('deep-core');

var _deepCore2 = _interopRequireDefault(_deepCore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Thrown when any exception occurs
 */

let Exception = exports.Exception = function (_Core$Exception$Excep) {
  _inherits(Exception, _Core$Exception$Excep);

  /**
   * @param {Array} args
   */

  function Exception() {
    var _Object$getPrototypeO;

    _classCallCheck(this, Exception);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(Exception)).call.apply(_Object$getPrototypeO, [this].concat(args)));
  }

  return Exception;
}(_deepCore2.default.Exception.Exception);