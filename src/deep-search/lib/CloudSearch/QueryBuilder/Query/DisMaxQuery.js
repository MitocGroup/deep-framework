/**
 * Created by AlexanderC on 1/12/16.
 */

'use strict';

import {Query} from '../Query';

export class DisMaxQuery extends Query {
  constructor() {
    super();
  }

  /**
   * @returns {String}
   */
  get type() {
    return Query.DISMAX;
  }
}