/**
 * Created by AlexanderC on 11/10/15.
 */

//https://github.com/eslint/eslint/issues/5150
/*eslint no-return-assign: 0*/

'use strict';

/**
 * @todo: Rename to Proxy
 */
export class MethodsProxy {
  /**
   * @param {Object} target
   */
  constructor(target) {
    this._target = target;
    this._decorator = null;
  }

  /**
   * @returns {Object}
   */
  get target() {
    return this._target;
  }

  /**
   * @param {Function} decorator
   * @returns {MethodsProxy}
   */
  decorate(decorator) {
    this._decorator = decorator;

    return this;
  }

  /**
   * @param {Object} handler
   * @param {String|String[]} explMethods
   * @returns {Object}
   */
  proxyOverride(handler, ...explMethods) {
    let methods = Object.keys(handler).concat(explMethods);

    for (let i in methods) {
      if (!methods.hasOwnProperty(i)) {
        continue;
      }

      let prop = methods[i];

      if (!handler.hasOwnProperty(prop) &&
        explMethods.indexOf(prop) === -1) {
        continue;
      }

      if (typeof handler[prop] === 'function') {
        Object.defineProperty(
          this._target,
          prop,
          {
            value: (...args) => {
              return (typeof this._decorator === 'function') ?
                this._decorator(handler, prop, ...args) :
                handler[prop](...args);
            },
          }
        );
      }
    }

    return this._target;
  }

   /**
   * @param {String} handler
   * @param {Object[]} explProps
   * @returns {Object|*}
   */
  proxyProperties(handler, ...explProps) {
    let propList = Object.keys(handler).concat(explProps);

    for (let prop of propList) {
      if (typeof handler[prop] === 'function') {
        continue;
      }

      let descriptor = Object.getOwnPropertyDescriptor(handler, prop);
      let targetDescriptor = {
        enumerable: descriptor.enumerable,
        configurable: descriptor.configurable,
        get: () => handler[prop],
      };

      if (descriptor.writable) {
        targetDescriptor.set = (value) => handler[prop] = value;
      }

      Object.defineProperty(this._target, prop, targetDescriptor);
    }

    return this._target;
  }

  /**
   * @param {Object} handler
   * @param {String|String[]} explMethods
   * @returns {Object}
   *
   * @todo Replace typeof hook with hasOwnProperty() when get rid of babel
   */
  proxy(handler, ...explMethods) {
    return this.proxyOverride(
      handler,
      ...(explMethods.filter((prop) => typeof this._target[prop] === 'undefined'))
    );
  }
}
