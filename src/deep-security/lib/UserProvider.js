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

    retrieveUserResource.request({Id: id}).send(function(response) {
      if (response.error) {
        throw new LoadUserException(id, response.error);
      }

      return callback(response.data);
    });
  }
}
