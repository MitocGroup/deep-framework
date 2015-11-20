/**
 * Created by mgoria on 11/12/15.
 */

'use strict';

import {Exception} from '../../Exception/Exception';

export class LoadCredentialsException extends Exception {
  /**
   * @param {String} exception
   */
  constructor(exception) {
    super(`Error on loading security credentials in deep-resource -> request. ${exception}`);
  }
}
