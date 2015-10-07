/**
 * Created by AlexanderC on 6/16/15.
 */

'use strict';

import {Exception} from './Exception';

/**
 * Thrown if flush() is not implemented
 */
export class NoFlushException extends Exception {
  constructor() {
    super('Flush is not implemented for this driver');
  }
}
