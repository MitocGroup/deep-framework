/**
 * Created by vcernomschi on 1/26/16.
 */

'use strict';

import {Runtime} from '../../node_modules/deep-core/lib.compiled/AWS/Lambda/Runtime';

/**
 * Lambda runtime mock to test validateRuntimeInput
 */

export class RuntimeMock extends Runtime {
  /**
   * @param {Object} kernel
   */
  constructor(kernel) {
    super(kernel);
  }

  /**
   * @returns {RuntimeMock}
   */
  handle() {
    return this;
  }
}
