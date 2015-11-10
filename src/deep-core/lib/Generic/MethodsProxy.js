/**
 * Created by AlexanderC on 11/10/15.
 */

'use strict';


export class MethodsProxy {
  /**
   * @param {Object} target
   */
  constructor(target) {
    this._target = target;
  }

  /**
   * @returns {Object}
   */
  get target() {
    return this._target;
  }

  /**
   * @param {Object} handler
   * @param {String|String[]} explMethods
   * @returns {Object}
   */
  proxyOverride(handler, ...explMethods) {
    let methods = Object.keys(handler).concat(explMethods);

    for (let prop of methods) {
      if (!handler.hasOwnProperty(prop) &&
        explMethods.indexOf(prop) === -1) {
        continue;
      }

      let func = handler[prop];

      if (typeof func === 'function') {
        Object.defineProperty(
          this._target,
          prop,
          {value: func}
        );
      }
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
