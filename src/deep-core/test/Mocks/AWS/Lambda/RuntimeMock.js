'use strict';

import {Runtime} from '../../../../lib/AWS/Lambda/Runtime';

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
