/**
 * Created by AlexanderC on 1/12/16.
 */

'use strict';

import {NativeParameter} from './NativeParameter';

export class Cursor extends NativeParameter {
  /**
   * @param {String} val
   */
  constructor(val = Cursor.RETRIEVE) {
    super();

    this._val = val.toString();
  }

  /**
   * @returns {String}
   */
  static get RETRIEVE() {
    return 'initial';
  }

  /**
   * @returns {String}
   */
  export() {
    return this._val.toString();
  }
}
