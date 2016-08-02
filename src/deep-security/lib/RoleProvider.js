/**
 * Created by CCristi on 7/15/16.
 */

'use strict';

export class RoleProvider {
  /**
   * @param {String} retrieveRoleResource
   * @param {Object} deepResourceService
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
      // securityContext(null) forces deep-resource to use cognito default credentials
      retrieveRolesRequest.request({}).securityContext(null).send(response => {
        if (response.error) {
          return reject(response.error);
        }

        resolve(response.data);
      });
    });
  }
}
