'use strict';

import {ExtendModel} from '../../lib.compiled/Vogels/ExtendModel';
import {UndefinedMethodException} from '../../lib.compiled/Vogels/Exceptions/UndefinedMethodException';
import {Exception} from '../../lib.compiled/Vogels/Exceptions/Exception';

/**
 * Extends ExtendModel to test exceptions
 */
export class ExtendModelMock extends ExtendModel {
  /**
   * @param {Object} model
   */
  constructor(...args) {
    super(args);
  }

  /**
   * @param {String} message
   */
  throwException(message) {
    throw new Exception(message);
  }

  /**
   * @param {String} name
   * @param {String[]} methods
   */
  throwUndefinedMethodException(name, methods) {
    throw new UndefinedMethodException(name, methods);
  }
}
