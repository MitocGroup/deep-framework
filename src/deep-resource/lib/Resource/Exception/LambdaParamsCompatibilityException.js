/**
 * Created by mgoria on 12/03/15.
 */

'use strict';

import {Exception} from '../../Exception/Exception';

export class LambdaParamsCompatibilityException extends Exception {
  /**
   * @param {Object} params
   * @param {String} message
   */
  constructor(params, message = '') {
    super(`Lambda parameters "${JSON.stringify(params)}" are incompatible. ${message}`);
  }
}
