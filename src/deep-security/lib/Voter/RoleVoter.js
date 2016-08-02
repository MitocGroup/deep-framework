/**
 * Created by CCristi on 7/15/16.
 */

'use strict';

import {VoterInterface} from './VoterInterface';
import {BaseVoter} from './BaseVoter';

export class RoleVoter extends VoterInterface {
  /**
   * @param {Object} role
   */
  constructor(role) {
    super();

    this._role = role;
  }

  /**
   * @param {String} context
   * @returns {Boolean}
   */
  vote(context) {
    for (let voter of this._negativeVoters) {
      if (voter.vote(context)) {
        return false;
      }
    }

    for (let voter of this._positiveVoters) {
      if (voter.vote(context)) {
        return true;
      }
    }

    return false;
  }

  /**
   * @returns {String}
   */
  get _positiveVoters() {
    let statements = this._role.Policy.Statement;

    return statements
      .filter(s => s.Effect === VoterInterface.ALLOW)
      .reduce((voters, statement) => {
        return voters.concat(statement.Action.map(BaseVoter.createFromAction));
      }, []);
  }

  /**
   * @returns {String}
   */
  get _negativeVoters() {
    let statements = this._role.Policy.Statement;

    return statements
      .filter(s => s.Effect === VoterInterface.DENY)
      .reduce((voters, statement) => {
        return voters.concat(BaseVoter.createFromAction(statement));
      }, []);
  }

  /**
   * @returns {Object}
   */
  get role() {
    return this._role;
  }
}
