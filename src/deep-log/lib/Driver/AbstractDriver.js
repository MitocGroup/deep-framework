/**
 * Created by AlexanderC on 6/15/15.
 */

'use strict';

import Core from 'deep-core';

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
}
