/**
 * Created by mgoria on 1/29/16.
 */

'use strict';

import Core from 'deep-core';
import frameworkEventSchema from './frameworkevent.schema';
import Joi from 'joi';
import {RumEventValidationException} from '../Exception/RumEventValidationException';

/**
 * Abstract RUM event
 */
export class AbstractEvent extends Core.OOP.Interface {
  /**
   * @param {Object} kernel
   * @param {Object} rawEvent
   */
  constructor(kernel, rawEvent) {
    super(['toJSON']);

    this._kernel = kernel;
    this._rawEvent = rawEvent;
  }

  /**
   * @returns {String}
   */
  static get FRAMEWORK_EVENT_LEVEL() {
    return 'Framework';
  }

  /**
   * @returns {String[]}
   */
  static get CONTEXTS() {
    return [
      'Frontend',
      'Backend',
    ];
  }

  /**
   * @returns {String[]}
   */
  static get SERVICES() {
    return [
      'deep-core',
      'deep-kernel',
    ];
  }

  /**
   * @returns {String[]}
   */
  static get RESOURCE_TYPES() {
    return [
      'Browser',
      'Lambda',
      'S3',
      'DynamoDB',
    ];
  }

  /**
   * @returns {Object}
   */
  validate() {
    let result = Joi.validate(this._rawEvent, frameworkEventSchema, {
      stripUnknown: true,
      convert: true,
      abortEarly: false,
    });

    if (result.error) {
      throw new RumEventValidationException('frameworkEventSchema', result.error);
    }

    return result.value;
  }
}