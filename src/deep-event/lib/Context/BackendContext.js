/**
 * Created by AlexanderC on 2/22/17.
 */

'use strict';

import {AbstractContext} from './AbstractContext';

export class BackendContext extends AbstractContext {  
  /**
   * @param {Kernel|*} kernel
   *
   * @returns {AbstractContext|*}
   */
  static fromKernel(kernel) {
    const runtimeContext = BackendContext._filterRuntimeContext(
      kernel.runtimeContext
    );
    
    return new this(runtimeContext);
  }
  
  /**
   * @param {*} runtimeContext
   * 
   * @returns {*}
   *
   * @private
   */
  static _filterRuntimeContext(runtimeContext) {
    const context = {};
    
    Object.keys(runtimeContext).forEach(key => {
      const value = runtimeContext[key];
      
      if (BackendContext._isScalarOrArray(value)) {
        context[key] = value;
      } else if (typeof value === 'object') {
        if (Object.keys(value).length <= 0) {
          context[key] = value;
        } else {
          const plainValue = BackendContext._filterRuntimeContext(value);
          
          if (Object.keys(plainValue).length > 0) {
            context[key] = plainValue;
          }
        }
      }
    });
    
    return context;
  }
  
  /**
   * @param {*} value
   * 
   * @returns {Boolean}
   *
   * @private
   */
  static _isScalarOrArray(value){
    return null === value 
      || Array.isArray(value) 
      || /string|number|boolean/i.test(typeof value);
  }
}
