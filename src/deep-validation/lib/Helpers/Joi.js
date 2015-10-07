/**
 * Created by AlexanderC on 5/25/15.
 */

'use strict';

import BaseJoi from 'joi';
import Vogels from './vogelsPolyfill';

/**
 * Abstraction on Joi validation expressions
 */
export class Joi {
  /**
   * @returns {Object}
   */
  static get uuid() {
    return Vogels.types.uuid();
  }

  /**
   * @returns {Object}
   */
  static get timeUUID() {
    return Vogels.types.timeUUID();
  }

  /**
   * @returns {Object}
   */
  static get stringSet() {
    return Vogels.types.stringSet();
  }

  /**
   * @returns {Object}
   */
  static get numberSet() {
    return Vogels.types.numberSet();
  }

  /**
   * @returns {Object}
   */
  static get binarySet() {
    return Vogels.types.binarySet();
  }

  /**
   * @returns {Object}
   */
  static get binary() {
    return BaseJoi.binary();
  }

  /**
   * @returns {Object}
   */
  static get number() {
    return BaseJoi.number();
  }

  /**
   * @returns {Object}
   */
  static get string() {
    return BaseJoi.string();
  }

  /**
   * @returns {Object}
   */
  static get boolean() {
    return BaseJoi.boolean();
  }

  /**
   * @returns {Object}
   */
  static get email() {
    return BaseJoi.string().email();
  }

  /**
   * @returns {Object}
   */
  static get website() {
    return BaseJoi.string().uri();
  }

  /**
   * @returns {Object}
   */
  static get map() {
    return BaseJoi.object();
  }

  /**
   * @returns {*}
   */
  static get mapSet() {
    let array = BaseJoi.array();
    if (array.includes) {
      return array.includes(BaseJoi.object());
    }

    return array.items(BaseJoi.object());
  }
}
