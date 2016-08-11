/**
 * Created by CCristi on 7/15/16.
 */

'use strict';

import {RoleVoter} from './Voter/RoleVoter';

export class RoleResolver {
  /**
   * @param {RoleProvider} roleProvider
   */
  constructor(roleProvider) {
    this._roleProvider = roleProvider;
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

    return this._roleProvider
      .getRoles()
      .then(roles => {
        this._voters = roles.map(r => new RoleVoter(r));

        return this._voters;
      });
  }
}
