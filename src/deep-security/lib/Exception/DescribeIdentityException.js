/**
 * Created by mgoria on 11/23/15.
 */

'use strict';

import {Exception} from './Exception';

/**
 * Thrown when describe cognito identity failed
 */
export class DescribeIdentityException extends Exception {
  /**
   * @param {String} identityId
   * @param {Object} error
   */
  constructor(identityId, error) {
    super(`Error on describing cognito identity ${identityId}. ${error}`);
  }
}
