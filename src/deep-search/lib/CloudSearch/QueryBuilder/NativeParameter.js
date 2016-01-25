/**
 * Created by AlexanderC on 1/12/16.
 */

'use strict';

import Core from 'deep-core';
import {Builder} from './Builder';

export class NativeParameter extends Core.OOP.Interface {
  constructor() {
    super('export');
  }

  /**
   * @param {Object} indexes
   * @param {String} str
   * @returns {String}
   */
  static _swapIndexFields(indexes, str) {
    return Builder._swapIndexFields(indexes, str);
  }
}