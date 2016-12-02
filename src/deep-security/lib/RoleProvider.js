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
    this._getRolesPromise = null;
  }

  /**
   * @returns {Promise}
   */
  getRoles() {
    if (!this._retrieveRoleResource) {
      return Promise.resolve([]);
    }

    if (!this._getRolesPromise) {
      this._getRolesPromise = new Promise((resolve, reject) => {
        let retrieveRolesRequest = this._deepResource.get(this._retrieveRoleResource);
        // authScope(null) forces deep-resource to use cognito default credentials
        retrieveRolesRequest.request({}).authScope(null).send(response => {
          if (response.error) {
            return reject(response.error);
          }

          resolve(response.data);
        });
      });
    }

    return this._getRolesPromise;
  }

  /**
   * @returns {RoleProvider}
   */
  invalidateCache() {
    this._getRolesPromise = null;
    return this;
  }
}
