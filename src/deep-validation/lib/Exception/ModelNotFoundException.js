/**
 * Created by AlexanderC on 6/15/15.
 */

'use strict';

import {Exception} from './Exception';

/**
 * Thrown when missing requested model
 */
export class ModelNotFoundException extends Exception {
  /**
   * @param {String} modelName
   */
  constructor(modelName) {
    super(`Model ${modelName} was not found`);
  }
}
