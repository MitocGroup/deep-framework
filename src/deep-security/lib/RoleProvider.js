/**
 * Created by CCristi on 7/15/16.
 */

'use strict';

export class RoleProvider {
  /**
   * @param {String} retrieveUserResource
   * @param {Object} deepResourceService
   */
  constructor(deepResourceService, retrieveUserResource = null) {
    this._retrieveUserResource = retrieveUserResource;
    this._deepResource = deepResourceService;
  }  

  /**
   * @returns {Promise}
   */
  getRoles() {
    if (!this._retrieveUserResource) {
      return Promise.resolve([]);
    }
    
    let retrieveRolesRequest = this._deepResource.get(this._retrieveUserResource);

    return new Promise((resolve, reject) => {
      retrieveRolesRequest.send(response => {
        if (response.error) {
          return reject(response.error);
        }

        resolve(response.data);
      });
    });
  }
}