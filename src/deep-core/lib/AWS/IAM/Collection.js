/**
 * Created by AlexanderC on 5/27/15.
 */

/*eslint no-proto: 0 */

'use strict';

import {Extractable} from './Extractable';
import {InvalidArgumentException} from '../../Exception/InvalidArgumentException';

/**
 * Collection of something
 */
export class Collection extends Extractable {
  /**
   * @param {Object} prototype
   */
  constructor(prototype) {
    super();

    if (prototype.__proto__ !== Extractable) {
      throw new InvalidArgumentException(prototype, Extractable);
    }

    this._prototype = prototype;
    this._vector = [];
  }

  /**
   * @returns {Object}
   */
  get prototype() {
    return this._prototype;
  }

  /**
   * @param {Array} args
   * @returns {Object}
   */
  create(...args) {
    return new this._prototype(...args);
  }

  /**
   * @param {Array} args
   * @returns {Object}
   */
  add(...args) {
    let instance = args.length === 1 && args[0] instanceof this._prototype
      ? args[0]
      : this.create(...args);

    this._vector.push(instance);

    return instance;
  }

  /**
   * @returns {Number}
   */
  count() {
    return this._vector.length;
  }

  /**
   * @returns {Array}
   */
  list() {
    return this._vector;
  }

  /**
   * @returns {Array}
   */
  extract() {
    let vector = [];

    for (let itemKey in this._vector) {
      if (!this._vector.hasOwnProperty(itemKey)) {
        continue;
      }

      let item = this._vector[itemKey];

      vector.push(item.extract());
    }

    return vector;
  }
}
