/**
 * Created by CCristi on 11/14/16.
 */

'use strict';

import Core from 'deep-core';

export class AbstractStrategy extends Core.OOP.Interface {
  constructor() {
    super(['onSuccess', 'onError']);
  }

  /**
   * @param {Response} response
   * @returns {Boolean}
   */
  decide(response) {
    return this[response.isError ? 'onError' : 'onSuccess'](response);
  }
}
