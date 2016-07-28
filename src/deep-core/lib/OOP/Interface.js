/**
 * Created by AlexanderC on 5/25/15.
 */

'use strict';

import {MethodsNotImplementedException} from '../Exception/MethodsNotImplementedException';

/**
 * Interface implementation
 */
export class Interface {
  /**
   * @param {String[]|String} abstractMethods
   */
  constructor(...abstractMethods) {
    let methods = abstractMethods.length === 1 && abstractMethods[0] instanceof Array
      ? abstractMethods[0]
      : abstractMethods;

    let notImplementedMethods = [];

    for (let abstractMethodKey in methods) {
      if (!methods.hasOwnProperty(abstractMethodKey)) {
        continue;
      }

      let abstractMethod = methods[abstractMethodKey];
      if (!(this[abstractMethod] instanceof Function)) {
        notImplementedMethods.push(abstractMethod);
      }
    }

    if (notImplementedMethods.length > 0) {
      throw new MethodsNotImplementedException(notImplementedMethods);
    }
  }
}
