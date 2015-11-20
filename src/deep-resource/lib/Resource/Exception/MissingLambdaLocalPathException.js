/**
 * Created by mgoria on 11/03/15.
 */

'use strict';

import {Exception} from '../../Exception/Exception';

export class MissingLambdaLocalPathException extends Exception {
  /**
   * @param {String} lambdaArn
   */
  constructor(lambdaArn) {
    super(`Missing local path for Lambda ${lambdaArn}`);
  }
}
