/**
 * Created by mgoria on 11/03/15.
 */

'use strict';

import {Exception} from '../../Exception/Exception';

export class MissingLocalLambdaExecWrapperException extends Exception {
  /**
   * @param {String} execWrapperKey
   */
  constructor(execWrapperKey) {
    super(`Missing local lambda execution wrapper in global.${execWrapperKey}`);
  }
}
