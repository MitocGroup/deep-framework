'use strict';

import {Runtime} from '../../../../lib/AWS/Lambda/Runtime';

export class RuntimeMock extends Runtime {
  constructor(kernel) {
    super(kernel);
  }

  handle() {
    this._kernel = 'handled';
    return this;
  }
}
