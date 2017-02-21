/**
 * Created by CCristi on 8/5/16.
 */

'use strict';

export class ContextProvider {
  /**
   * @param {Object} runtimeContext
   */
  constructor(runtimeContext) {
    this._context = runtimeContext;
  }

  /**
   * @param {Object} event
   * @returns {ContextProvider}
   */
  fillContextWithEventData(event) {
    this._context[ContextProvider.FRAMEWORK_NAMESPACE_KEY] = {};
    this._context.getDeepFrameworkOption = function(option) {
      return this[ContextProvider.FRAMEWORK_NAMESPACE_KEY][option];
    };

    [ContextProvider.MAIN_REQUEST_ID, ContextProvider.LAMBDA_DEPTH_LEVEL].forEach(option => {
      if (event.hasOwnProperty(option)) {
        this._context[ContextProvider.FRAMEWORK_NAMESPACE_KEY][option] = event[option];
      }
    });

    // moving _deep_auth_context_ from event to lambda context
    if (event.hasOwnProperty(ContextProvider.DEEP_AUTH_CONTEXT_KEY) &&
      !this._context.hasOwnProperty('identity')) {
      this._context.identity = event[ContextProvider.DEEP_AUTH_CONTEXT_KEY];

      delete event[ContextProvider.DEEP_AUTH_CONTEXT_KEY];
    }

    return this;
  }

  /**
   * @returns {Object}
   */
  get context() {
    return this._context;
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

  /**
   * @returns {String}
   */
  static get LAMBDA_DEPTH_LEVEL() {
    return 'lambdaDepthLevel';
  }

  /**
   * @returns {String}
   */
  static get DEEP_AUTH_CONTEXT_KEY() {
    return '_deep_auth_context_';
  }
}
