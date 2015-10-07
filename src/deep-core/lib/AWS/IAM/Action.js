/**
 * Created by AlexanderC on 5/27/15.
 */

'use strict';

import {Extractable} from './Extractable';
import {Service} from '../Service';
import {InvalidArgumentException} from '../../Exception/InvalidArgumentException';
import {Policy} from './Policy';

/**
 * Iam statement action
 */
export class Action extends Extractable {
  constructor() {
    super();

    this._service = Policy.ANY;
    this._action = Policy.ANY;
  }

  /**
   * @param {String} action
   */
  set action(action) {
    this._action = action;
  }

  /**
   * @returns {String}
   */
  get action() {
    return this._action;
  }

  /**
   * @param {String} name
   */
  set service(name) {
    if (!Service.exists(name)) {
      throw new InvalidArgumentException(name, Service);
    }

    this._service = name;
  }

  /**
   * @returns {String}
   */
  get service() {
    return this._service;
  }

  /**
   * @returns {String}
   */
  extract() {
    let service = this._service;
    let action = this._action;

    return `${service}:${action}`;
  }
}
