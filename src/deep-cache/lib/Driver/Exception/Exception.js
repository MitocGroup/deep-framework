/**
 * Created by AlexanderC on 6/16/15.
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
