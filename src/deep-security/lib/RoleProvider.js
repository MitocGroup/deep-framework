/**
 * Created by CCristi on 7/15/16.
 */

'use strict';

export class RoleProvider {
  /**
   * @param {Object} deepResourceService
   * @param {String} retrieveRoleResource
   */
  constructor(deepResourceService, retrieveRoleResource = null) {
    this._retrieveRoleResource = retrieveRoleResource;
    this._deepResource = deepResourceService;
  }

  /**
   * @returns {Promise}
   */
  getRoles() {
    if (!this._retrieveRoleResource) {
      return Promise.resolve([]);
    }

    let retrieveRolesRequest = this._deepResource.get(this._retrieveRoleResource);

    return new Promise((resolve, reject) => {
      // authScope(null) forces deep-resource to use cognito default credentials
      retrieveRolesRequest.request({}).authScope(null).send(response => {
        if (response.error) {
          return reject(response.error);
        }

        resolve(response.data);
      });
    });
  }
}
