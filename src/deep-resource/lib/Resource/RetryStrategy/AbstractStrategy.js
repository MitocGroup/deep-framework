/**
 * Created by CCristi on 11/14/16.
 */

'use strict';

import Core from 'deep-core';

export class AbstractStrategy extends Core.OOP.Interface {
  constructor() {
    super(['onSuccess', 'onError']);

    this._count = 0;
  }

  /**
   * @param {Response} response
   * @returns {Boolean}
   */
  decide(response) {
    return this[response.isError ? 'onError' : 'onSuccess'](response) && --this._count > 0;
  }

  /**
   * @param {Number} count
   */
  set count(count) {
    this._count = count;
  }

  /**
   * @returns {Number}
   */
  get count() {
    return this._count;
  }
}
