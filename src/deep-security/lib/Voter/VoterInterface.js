/**
 * Created by CCristi on 7/15/16.
 */

'use strict';

import Core from 'deep-core';

export class VoterInterface extends Core.OOP.Interface {
  constructor() {
    super(['vote']) ;
  }

  /**
   * @returns {String}
   */
  static get ALLOW() {
    return 'Allow';
  }

  /**
   * @returns {String}
   */
  static get DENY() {
    return 'Deny';
  }
}
