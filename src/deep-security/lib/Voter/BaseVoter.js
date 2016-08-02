/**
 * Created by CCristi on 7/15/16.
 */

'use strict';

import Core from 'deep-core';
import {VoterInterface} from './VoterInterface';

export class BaseVoter extends VoterInterface {
  /**
   * @param {String|RegExp|Function|VoterInterface} validateExpression
   */
  constructor(validateExpression) {
    super();

    this._validateExpression = validateExpression;
  }

  /**
   * @param {String} context
   * @returns {*}
   */
  vote(context) {
    if (typeof this._validateExpression === 'string') {
      return this._validateExpression === context;
    } else if (this._validateExpression instanceof RegExp) {
      return this._validateExpression.test(context);
    } else if (this._validateExpression instanceof Function) {
      return this._validateExpression(context);
    } else if (this._validateExpression instanceof VoterInterface) {
      return this._validateExpression.vote(context);
    }

    throw new Core.Exception.InvalidArgumentException(this._validateExpression, 'String, Number, Function, BaseVoter');
  }

  /**
   * @param {String} actionIdentifier
   * @returns {BaseVoter}
   */
  static createFromAction(actionIdentifier) {
    let actionsParts = actionIdentifier.split(':');
    let escapePart = part => part && part !== '*' ?
      part.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') :
      '[a-zA-Z\\d+\\-_\\.]+';

    let microservice = escapePart(actionsParts[0]);
    let resource = escapePart(actionsParts[1]);
    let action = escapePart(actionsParts[2]);
    let regExp = new RegExp(`^\\s*${microservice}:${resource}:${action}\\s*$`);

    return new BaseVoter(regExp);
  }
}
