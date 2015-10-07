/**
 * Created by Stefan Hariton on 6/25/15.
 */

'use strict';

import {Exception as BaseException} from '../../Exception/Exception';

/**
 * Base exception
 */
export class Exception extends BaseException {
  /**
   * @param {Array} args
   */
  constructor(...args) {
    super(...args);
  }
}
