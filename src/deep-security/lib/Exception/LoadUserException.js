/**
 * Created by mgoria on 7/10/15.
 */

'use strict';

import {Exception} from './Exception';

/**
 * Thrown when load user form db failed
 */
export class LoadUserException extends Exception {
  /**
   * @param {String} identityId
   * @param {Object} error
   */
  constructor(identityId, error) {
    super(`Error on loading user ${identityId} from db. ${error}`);
  }
}
