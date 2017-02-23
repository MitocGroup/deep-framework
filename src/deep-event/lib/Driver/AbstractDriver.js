/**
 * Created by AlexanderC on 2/22/17.
 */

'use strict';

export class AbstractDriver {
  /**
   * @param {*} context
   */
  constructor(context) {
    this._context = context;
  }
  
  /**
   * @returns {*}
   */
  get context() {
    return this._context;
  }
  
  /**
   * @param   {String} name
   * @param   {*} data
   * @param   {*} context
   *
   * @returns {Promise|*}
   */
  log(name, data, context = {}) {
    return this._log(
      name, 
      data, 
      this.context.enrichEventContext(context)
    );
  }
  
  /**
   * @param   {String} name
   * @param   {*} data
   * @param   {*} context
   *
   * @returns {Promise|*}
   *
   * @private
   */
  _printEvent(name, data, context) {
    console.log('[EVENT]', name, '{DATA->', data , '}', '{CONTEXT->', context, '}');
    
    return Promise.resolve();
  }
  
  /**
   * @param   {String} name
   * @param   {*} data
   * @param   {Object} context
   *
   * @returns {Promise|*}
   *
   * @private
   */
  _log(name, data, context) {
    return Promise.reject(new Error(`Driver._log() not implemented!`));
  }
}
