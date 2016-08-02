/**
 * Created by CCristi on 7/15/16.
 */

'use strict';

import {RoleVoter} from './Voter/RoleVoter';

export class RoleResolver {
  /**
   * @param {Security} security
   */
  constructor(security) {
    this._security = security;
    this._voters = null;
  }

  /**
   * @returns {RoleResolver}
   */
  invalidateCache() {
    this._voters = null;
    return this;
  }

  /**
   * @param {String} context
   * @returns {Object}
   */
  resolve(context) {
    return this
      .getContextVoters()
      .then(voters => {
        for (let voter of voters) {
          if (voter.vote(context)) {
            return voter.role;
          }
        }

        return null;
      });
  }

  /**
   * @returns {Promise}
   */
  getContextVoters() {
    if (this._voters !== null) {
      return Promise.resolve(this._voters);
    }

    let roleProvider = this._security.roleProvider;
    let token = this._security.token;

    return roleProvider
      .getRoles()
      .then(roles => {
        return new Promise((resolve, reject) => {
          token.getUser((error, user) => {
            if (error) {
              return reject(error);
            }

            let userRoles = user && user.Roles ? user.Roles : [];
            let userRolesObjs = this._voters = roles.filter(r => userRoles.indexOf(r.Id) !== -1);

            this._voters = userRolesObjs.map(r => new RoleVoter(r));

            resolve(this._voters);
          });
        });
      });
  }
}
