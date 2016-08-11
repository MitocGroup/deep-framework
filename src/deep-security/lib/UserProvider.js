'use strict';

import {LoadUserException} from './Exception/LoadUserException';

/**
 * Loads user from db
 */
export class UserProvider {
  /**
   * @param {String} retrieveUserResource
   * @param {Object} deepResourceService
   */
  constructor(retrieveUserResource, deepResourceService) {
    this._retrieveUserResource = retrieveUserResource;
    this._deepResource = deepResourceService;
  }

  /**
   * @param {String} id
   * @param {Function} callback
   */
  loadUserByIdentityId(id, callback) {
    let retrieveUserResource = this._deepResource.get(this._retrieveUserResource);

    // authScope(null) forces deep-resource to use cognito default credentials
    retrieveUserResource.request({Id: id}).authScope(null).send(response => {
      if (response.error) {
        callback(new LoadUserException(id, response.error), null);
        return;
      }

      return callback(null, response.data);
    });
  }
}
