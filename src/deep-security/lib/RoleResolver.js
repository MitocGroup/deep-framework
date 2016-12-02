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
    return this._roleProvider
      .getRoles()
      .then(roles => roles.map(r => new RoleVoter(r)));
  }
}
