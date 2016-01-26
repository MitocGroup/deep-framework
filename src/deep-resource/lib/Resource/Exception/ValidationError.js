/**
 * Created by AlexanderC on 1/25/16.
 */

'use strict';

import {Exception} from '../../Exception/Exception';

export class ValidationError extends Exception {

  /**
   * @param {String} annotation
   * @param {{message:*,path:*,type:*,context:*}[]} validationErrors
   */
  constructor(annotation, validationErrors) {
    super(`Payload validation failed: ${annotation}`);

    this._validationErrors = validationErrors;
  }

  /**
   * @returns {{message:*,path:*,type:*,context:*}[]}
   */
  get validationErrors() {
    return this._validationErrors;
  }
}
