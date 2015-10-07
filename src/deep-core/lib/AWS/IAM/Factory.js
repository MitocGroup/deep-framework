/**
 * Created by AlexanderC on 6/2/15.
 */

'use strict';

import {Resource} from './Resource';
import {Collection} from './Collection';
import {Action} from './Action';
import {Policy} from './Policy';
import {Statement} from './Statement';

/**
 *  AWS IAM factory
 */
export class Factory {
  /**
   * @param {Function|*} Prototype
   * @param {Array} args
   * @returns {Object}
   */
  static create(Prototype, ...args) {
    Prototype = Factory._assurePrototype(Prototype);

    return new Prototype(...args);
  }

  /**
   * @param {Function|*} Prototype
   * @returns {Collection}
   */
  static createCollection(Prototype) {
    Prototype = Factory._assurePrototype(Prototype);

    return new Collection(Prototype);
  }

  /**
   * @param {Function|*} Prototype
   * @returns {Function}
   * @private
   */
  static _assurePrototype(Prototype) {
    if (typeof Prototype === 'string') {
      Prototype = Factory[Prototype.toUpperCase()];
    }

    return Prototype;
  }

  /**
   * @returns {Policy}
   * @constructor
   */
  static get POLICY() {
    return Policy;
  }

  /**
   * @returns {Action}
   * @constructor
   */
  static get RESOURCE() {
    return Resource;
  }

  /**
   * @returns {Resource}
   * @constructor
   */
  static get ACTION() {
    return Action;
  }

  /**
   * @returns {Statement}
   * @constructor
   */
  static get STATEMENT() {
    return Statement;
  }
}
