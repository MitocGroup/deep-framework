/**
 * Created by CCristi on 11/14/16.
 */

'use strict';

import {AbstractStrategy} from './AbstractStrategy';
import {StrategyFactory} from './StrategyFactory';

export class ComplexStrategy extends AbstractStrategy {
  constructor(strategies) {
    super();
    
    this._strategies = strategies;
  }

  /**
   * @param {Response} response
   * @returns {Boolean}
   */
  onError(response) {
    return this._strategies.reduce((onErrorBool, strategy) => {
      return onErrorBool || strategy.onError(response);
    }, false);
  }

  /**
   * @param {Response} response
   * @returns {Boolean}
   */
  onSuccess(response) {
    return this._strategies.reduce((onSuccessBool, strategy) => {
      return onSuccessBool || strategy.onSuccess(response);
    }, false);
  }

  /**
   * @param strategy
   * @returns {ComplexStrategy}
   */
  addStrategy(strategy) {
    this._strategies.push(StrategyFactory.create(strategy));
    return this;
  }
}
