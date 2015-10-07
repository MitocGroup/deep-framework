/**
 * Created by AlexanderC on 5/25/15.
 */

'use strict';

import {Response} from './Response';

/**
 * Error response sent to the lambda context
 */
export class ErrorResponse extends Response {
  /**
   * @param {*} args
   */
  constructor(...args) {
    super(...args);
  }

  /**
   * @returns {String}
   */
  get contextMethod() {
    return 'fail';
  }
}
