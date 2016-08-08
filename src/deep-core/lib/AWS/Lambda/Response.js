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
   * @param {Runtime} runtime
   * @param {Object} data
   */
  constructor(runtime, data) {
    this._data = data;
    this._runtime = runtime;
  }

  /**
   * @returns {Runtime}
   */
  get runtime() {
    return this._runtime;
  }

  /**
   * @returns {Boolean}
   */
  get contextSent() {
    return this._runtime.contextSent;
  }

  /**
   * @returns {Response}
   */
  send() {
    if (!this._runtime.context) {
      throw new MissingRuntimeContextException();
    // @TODO: Figure out why lambda container caches _runtime.contextSent
    // } else if (this.contextSent) {
    //   throw new ContextAlreadySentException();
    }

    this.runtime.logService.rumLog({
      service: 'deep-core',
      resourceType: 'Lambda',
      resourceId: this.runtime.context.invokedFunctionArn,
      eventName: 'Run',
    });

    // flush RUM batched messages if any
    this.runtime.logService.rumFlush((error, data) => {
      // @todo: via setter?
      this._runtime._contextSent = true;

      (this._runtime.resolver || this._runtime.context)[this.constructor.contextMethod](this.data);
    });

    return this;
  }

  /**
   *
   * @returns {Object}
   * @private
   */
  get data() {
    return this._data;
  }

  /**
   * @returns {Object}
   */
  get rawData() {
    return this._data;
  }

  /**
   * @returns {String}
   */
  static get contextMethod() {
    return 'succeed';
  }
}
