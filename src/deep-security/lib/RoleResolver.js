/**
 * Created by CCristi on 7/15/16.
 */

'use strict';

import {RoleVoter} from './Voter/RoleVoter';

export class RoleResolver {
  /**
   * @param {RoleProvider} roleProvider
   * @param {Token} token
   */
  constructor(roleProvider, token) {
    this._roleProvider = roleProvider;
    this._token = token;
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
      .getVoters()
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
  getVoters() {
    if (this._voters !== null) {
      return Promise.resolve(this._voters);
    }

    return this._roleProvider
      .getRoles()
      .then(roles => {
        return new Promise((resolve, reject) => {
          this._token.getUser((error, user) => {
            if (error) {
              return reject(error);
            }

            let userRoles = user && user.Roles ? user.Roles : [];

            this._voters = roles
              .filter(r => userRoles.indexOf(r.Id) !== -1)
              .map(r => new RoleVoter(r));

            resolve(this._voters);
          });
        });
      });
  }
}
