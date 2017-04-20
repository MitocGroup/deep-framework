'use strict';

import {AbstractUserProvider} from './AbstractUserProvider';

export class BackendUserProvider extends AbstractUserProvider {
  /**
   * @param {String} userModelName
   * @param {*} deepDb
   */
  constructor(userModelName, deepDb) {
    super();

    this.userModelName = userModelName;
    this.deepDb = deepDb;
  }

  /**
   * @param {String} id
   * @param {Function} callback
   */
  loadUserByIdentityId(id, callback) {
    let userModel = null;

    if (this.deepDb.has(this.userModelName)) {
      userModel = this.deepDb.get(this.userModelName);
    }

    if (!userModel) {
      callback(null, null);
      return;
    }

    userModel.findOneById(id, (error, item) => {
      callback(error, item && item.get());
    });
  }
}
