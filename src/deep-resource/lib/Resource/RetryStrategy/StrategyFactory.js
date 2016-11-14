/**
 * Created by CCristi on 11/14/16.
 */

'use strict';

import {CustomStrategy} from './CustomStrategy';
import Core from 'deep-core';
import './InternalErrorStrategy'; // browserify fix

export class StrategyFactory {
  /**
   * @param {String|Function} strategy
   * @param {Object[]} args
   * @returns {AbstractStrategy}
   */
  static create(strategy = 'internal-error', ...args) {
    if (typeof strategy === 'string') {
      const strategyFullName = `${StrategyFactory._pascalCase(strategy)}Strategy`;
      const StrategyProto = require(`./${strategyFullName}`)[strategyFullName];

      return new StrategyProto(...args);
    } else if (typeof strategy === 'function') {
      return new CustomStrategy(strategy, ...args);
    }

    throw new Core.Exception.InvalidArgumentException(strategy, 'string|function');
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

