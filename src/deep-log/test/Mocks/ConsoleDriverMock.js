/**
 * Created by AlexanderC on 6/15/15.
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _AbstractDriver2 = require('./AbstractDriver');

var _Log = require('../Log');

/**
 * Console native logging
 */

var ConsoleDriver = (function (_AbstractDriver) {
  _inherits(ConsoleDriver, _AbstractDriver);

  function ConsoleDriver() {
    _classCallCheck(this, ConsoleDriver);

    _get(Object.getPrototypeOf(ConsoleDriver.prototype), 'constructor', this).call(this);

    this._console = ConsoleDriver._buildConsole();
  }

  /**
   * @returns {Object}
   * @private
   */

  _createClass(ConsoleDriver, [{
    key: 'log',

    /**
     * @param {String} msg
     * @param {String} level
     * @param {*} context
     */
    value: function log(msg, level, context) {
      var nativeMethod = 'log';

      switch (level) {
        case _Log.Log.EMERGENCY:
        case _Log.Log.ERROR:
        case _Log.Log.CRITICAL:
          nativeMethod = 'error';
          break;
        case _Log.Log.ALERT:
        case _Log.Log.WARNING:
          nativeMethod = 'warn';
          break;
        case _Log.Log.NOTICE:
          nativeMethod = 'log';
          break;
        case _Log.Log.INFO:
          nativeMethod = 'info';
          break;
        case _Log.Log.DEBUG:
          nativeMethod = 'debug';
          break;
      }

      // Fixes issue with node env
      (this._console[nativeMethod] || this._console.log)(_AbstractDriver2.AbstractDriver.timeString, msg);

      // @todo: figure out a better way of dumping context
      if (context) {
        // Fixes issue with node env
        (this._console.debug || this._console.log)('[DEBUG]', context);
      }
    }

    /**
     * @returns {ConsoleDriver}
     */
  }, {
    key: 'overrideNative',
    value: function overrideNative() {
      var _this = this;

      var nativeConsole = ConsoleDriver.nativeConsole;

      var _loop = function (i) {
        if (!ConsoleDriver.METHODS_TO_OVERRIDE.hasOwnProperty(i)) {
          return 'continue';
        }

        var method = ConsoleDriver.METHODS_TO_OVERRIDE[i];

        nativeConsole[method] = function () {
          var _console;

          for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          (_console = _this._console)[method].apply(_console, [_AbstractDriver2.AbstractDriver.timeString].concat(args));
        };
      };

      for (var i in ConsoleDriver.METHODS_TO_OVERRIDE) {
        var _ret = _loop(i);

        if (_ret === 'continue') continue;
      }

      return this;
    }

    /**
     * @returns {Object}
     */
  }], [{
    key: '_buildConsole',
    value: function _buildConsole() {
      var nativeConsole = ConsoleDriver.nativeConsole;
      var console = {};

      for (var i in ConsoleDriver.METHODS_TO_OVERRIDE) {
        if (!ConsoleDriver.METHODS_TO_OVERRIDE.hasOwnProperty(i)) {
          continue;
        }

        var method = ConsoleDriver.METHODS_TO_OVERRIDE[i];

        // Fixes issue with node env
        if (method === 'debug' && typeof nativeConsole[method] === 'undefined') {
          method = 'log';
        }

        console[method] = nativeConsole[method];
      }

      return console;
    }
  }, {
    key: 'nativeConsole',
    get: function get() {
      return typeof window === 'undefined' ? console : window.console;
    }

    /**
     * @returns {String[]}
     */
  }, {
    key: 'METHODS_TO_OVERRIDE',
    get: function get() {
      return ['error', 'log', 'warn', 'info', 'debug'];
    }
  }]);

  return ConsoleDriver;
})(_AbstractDriver2.AbstractDriver);

exports.ConsoleDriver = ConsoleDriver;