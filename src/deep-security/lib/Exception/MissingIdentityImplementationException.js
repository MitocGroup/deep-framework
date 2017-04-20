/**
 * Created by CCristi on 4/04/17.
 */

'use strict';

import {Exception} from './Exception';


export class MissingIdentityImplementationException extends Exception {
  /**
   * @param {String} providerName
   */
  constructor(providerName) {
    super(`Missing identity implementation for "${providerName}"`);
  }
}
