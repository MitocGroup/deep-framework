/**
 * Created by CCristi on 11/14/16.
 */

'use strict';

import {CustomStrategy} from './CustomStrategy';

export class StrategyFactory {
  /**
   * @param {String|Function} strategy
   * @returns {AbstractStrategy}
   */
  static create(strategy = 'internal-error') {
    if (typeof strategy === 'string') {
      const strategyFullName = `${StrategyFactory._pascalCase(strategy)}Strategy`;
      const StrategyInstance = require(`./${strategyFullName}`)[strategyFullName];

      return new StrategyInstance();
    } else if (typeof strategy === 'function') {
      return new CustomStrategy(strategy);
    }

    throw new Error('Strategy must be a "string" or a "function"');
  }

  /**
   * @param {String} str
   * @returns {String}
   */
  static _pascalCase(str) {
    return str
      .split(/[^a-zA-Z0-9]+/)
      .reduce((pascalString, part) => {
        return pascalString + part.charAt(0).toUpperCase() + part.slice(1);
      }, '');
  }
}

