/**
 * Created by AlexanderC on 6/15/15.
 */

'use strict';

import Core from 'deep-core';
import crypto from 'crypto';

/**
 * Abstract log driver
 */
export class AbstractDriver extends Core.OOP.Interface {
  constructor() {
    super(['log']);
  }

  /**
   * @param {*} context
   * @returns {String}
   */
  static plainifyContext(context) {
    let type = typeof context;
    var plainContext;

    if (type === 'object') {
      plainContext = JSON.stringify(context);
    } else if (context instanceof Object) {
      plainContext = `${type}: ${context.toString()}`;
    } else {
      plainContext = context.toString();
    }

    return plainContext;
  }

  /**
   * @returns {String}
   */
  static get datetime() {
    return new Date().toISOString();
  }

  /**
   * @returns {String}
   */
  static get timeString() {
    return new Date().toTimeString();
  }

  /**
   * @param {String} str
   * @returns {String}
   */
  static _md5(str) {
    return crypto
      .createHash('md5')
      .update(str)
      .digest('hex');
  }
}
