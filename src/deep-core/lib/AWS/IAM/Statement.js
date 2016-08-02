/**
 * Created by AlexanderC on 5/27/15.
 */

/*eslint no-eq-null: 0, eqeqeq:0 */

'use strict';

import {Resource} from './Resource';
import {Collection} from './Collection';
import {Action} from './Action';
import {Policy} from './Policy';
import {Extractable} from './Extractable';
import {InvalidArgumentException} from '../../Exception/InvalidArgumentException';

/**
 * IAM policy statement
 */
export class Statement extends Extractable {
  constructor() {
    super();

    this._effect = Statement.ALLOW;
    this._action = new Collection(Action);
    this._notAction = new Collection(Action);
    this._resource = new Collection(Resource);
    this._notResource = new Collection(Resource);
    this._condition = null;
    this._principal = null;
  }

  /**
   * @param {String} effect
   */
  set effect(effect) {
    if ([Statement.ALLOW, Statement.DENY].indexOf(effect) === -1) {
      throw new InvalidArgumentException(effect, '[Statement.ALLOW, Statement.DENY]');
    }

    this._effect = effect;
  }

  /**
   * @returns {String}
   */
  get effect() {
    return this._effect;
  }

  /**
   * @param {Object} condition
   */
  set condition(condition) {
    this._condition = condition;
  }

  /**
   * @returns {Object}
   */
  get condition() {
    return this._condition;
  }

  /**
   * @param {*} principal
   */
  set principal(principal) {
    this._principal = principal;
  }

  /**
   * @returns {*}
   */
  get principal() {
    return this._principal;
  }

  /**
   * @returns {Collection}
   */
  get notResource() {
    return this._notResource;
  }

  /**
   * @returns {Collection}
   */
  get resource() {
    return this._resource;
  }

  /**
   * @returns {Collection}
   */
  get notAction() {
    return this._notAction;
  }

  /**
   * @returns {Collection}
   */
  get action() {
    return this._action;
  }

  /**
   * @returns {String}
   */
  static get ALLOW() {
    return 'Allow';
  }

  /**
   * @returns {String}
   */
  static get DENY() {
    return 'Deny';
  }

  /**
   * @returns {Object}
   */
  extract() {
    let actions = this._action.count() > 0 ? this._action.extract() : Policy.ANY;
    let resources = this._resource.count() > 0 ? this._resource.extract() : null;

    let statement = {
      Effect: this._effect,
      Action: actions,
    };

    if (resources !== null) {
      statement.Resource = resources;
    }

    if (this._condition !== null && this._condition instanceof Object) {
      statement.Condition = this._condition;
    }

    // @todo - create separate class for Principal
    if (this._principal != null) {
      statement.Principal = this._principal;
    }

    if (this._notAction.count() > 0) {
      statement.NotAction = this._notAction.extract();
    }

    if (this._notResource.count() > 0) {
      statement.NotResource = this._notResource.extract();
    }

    return statement;
  }
}
