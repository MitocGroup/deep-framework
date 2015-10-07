/**
 * Created by AlexanderC on 5/25/15.
 */

'use strict';

import {MissingRuntimeContextException} from './Exception/MissingRuntimeContextException';

/**
 * Response sent to the lambda context
 */
export class Response {
  /**
   * @param {*} data
   */
  constructor(data) {
    this._data = data;
    this._runtimeContext = null;
  }

  /**
   * @param {Object} context
   */
  set runtimeContext(context) {
    this._runtimeContext = context;
  }

  /**
   * @returns {Object}
   */
  get runtimeContext() {
    return this._runtimeContext;
  }

  /**
   * @returns {Response}
   */
  send() {
    if (!this._runtimeContext) {
      throw new MissingRuntimeContextException();
    }

    this._runtimeContext[this.contextMethod](this._data);

    return this;
  }

  /**
   * @returns {*}
   */
  get data() {
    return this._data;
  }

  /**
   * @returns {String}
   */
  get contextMethod() {
    return 'succeed';
  }
}
