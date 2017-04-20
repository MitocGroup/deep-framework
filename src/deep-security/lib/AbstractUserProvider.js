'use strict';

export class AbstractUserProvider {
  /**
   * @param {String} id
   * @param {Function} callback
   */
  loadUserByIdentityId(id, callback) {
    throw new Error(`Abstract method not implemented.`);
  }
}
