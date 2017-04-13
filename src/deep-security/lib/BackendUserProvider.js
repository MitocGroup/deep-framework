'use strict';

import {AbstractUserProvider} from './AbstractUserProvider';

export class BackendUserProvider extends AbstractUserProvider {
  /**
   * @param {String} userModel
   */
  constructor(userModel) {
    this._userModel = userModel;
  }

  /**
   * @param {String} id
   * @param {Function} callback
   */
  loadUserByIdentityId(id, callback) {
    if (!this._userModel) {
      callback(null, null);
      return;
    }

    this._userModel.findOneById(id, (error, item) => {
      callback(error, item && item.get());
    });
  }
}
