/**
 * Created by CCristi on 8/5/16.
 */

'use strict';

export class BackendContext {
  /**
   * @param {Object} runtimeContext
   */
  constructor(runtimeContext) {
    this._runtimeContext = runtimeContext;
  }

  /**
   * @param {Object} event
   * @returns {BackendContext}
   */
  fillWithEventData(event) {
    this._runtimeContext[BackendContext.FRAMEWORK_NAMESPACE_KEY] = {};
    this._runtimeContext.getDeepFrameworkOption = function(option) {
      return this[BackendContext.FRAMEWORK_NAMESPACE_KEY][option];
    };

    [BackendContext.MAIN_REQUEST_ID].forEach(option => {
      if (event.hasOwnProperty(option)) {
        this._runtimeContext[BackendContext.FRAMEWORK_NAMESPACE_KEY][option] = event[option];
      }
    });
    
    return this;
  }

  /**
   * @returns {Object}
   */
  get runtimeContext() {
    return this._runtimeContext;
  }

  /**
   * @returns {String}
   */
  static get FRAMEWORK_NAMESPACE_KEY() {
    return 'deepFramework';
  }

  /**
   * @returns {String}
   */
  static get MAIN_REQUEST_ID() {
    return 'mainRequestId';
  }
}
