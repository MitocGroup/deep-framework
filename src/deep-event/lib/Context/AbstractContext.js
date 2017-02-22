/**
 * Created by AlexanderC on 2/22/17.
 */

'use strict';

export class AbstractContext {
  /**
   * @param {*} context
   */
  constructor(context = {}) {
    this._context = {};
    
    this.addObj(context);
  }
  
  /**
   * @param {Kernel|*} kernel
   */
  static fromKernel(kernel) {
    throw new Error('Context.fromKernel() not implemented!');
  }
  
  /**
   * @param {*} obj
   *
   * @returns {AbstractContext|*}
   */
  addObj(obj) {
    this._context = Object.assign(this._context, obj);
    
    return this;
  }
  
  /**
   * @param {String} key
   * @param {*} value
   *
   * @returns {AbstractContext|*}
   */
  add(key, value) {
    this._context[key] = value;
    
    return this;
  }
  
  /**
   * @returns {*}
   */
  get() {
    return this._context;
  }
  
  /**
   * @param {*} originalContext
   *
   * @returns {*}
   */
  enrichEventContext(originalContext) {
    originalContext = this.extend(originalContext);
    originalContext.timestamp = Date.now();
    
    return originalContext;
  }
  
  /**
   * @param {*} context
   *
   * @returns {*}
   */
  extend(context) {
    return Object.assign({}, this.get(), context);
  }
}
