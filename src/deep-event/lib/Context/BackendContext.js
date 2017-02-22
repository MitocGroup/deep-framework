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
    return new BackendContext(kernel.runtimeContext);
  }
}
