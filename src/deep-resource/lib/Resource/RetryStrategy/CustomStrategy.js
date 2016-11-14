/**
 * Created by CCristi on 11/14/16.
 */

'use strict';

import {AbstractStrategy} from './AbstractStrategy';

export class CustomStrategy extends AbstractStrategy {
  /**
   * @param {Function} onError
   * @param {Function} onSuccess
   */
  constructor(onError = () => false, onSuccess = () => false) {
    super();
    
    this._onErrorCb = onError;
    this._onSuccessCb = onSuccess;
  }

  /**
   * @param {Response} response
   * @returns {*}
   */
  onSuccess(response) {
    return this._onSuccessCb(response);
  }

  /**
   * @param {Response} response
   * @returns {*}
   */
  onError(response) {
    return this._onErrorCb(response)
  }
}
