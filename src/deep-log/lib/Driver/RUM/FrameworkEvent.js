/**
 * Created by mgoria on 1/29/16.
 */

'use strict';

import Joi from 'joi';
import {AbstractEvent} from './AbstractEvent';

/**
 * Framework event level
 */
export class FrameworkEvent extends AbstractEvent {
  /**
   * @param {Array} args
   */
  constructor(...args) {
    super(...args);
  }

  /**
   * @returns {String}
   */
  get eventLevel() {
    return AbstractEvent.FRAMEWORK_EVENT_LEVEL;
  }

  /**
   * @returns {Object}
   */
  toJSON() {
    return this._data;
  }

  /**
   * @returns {Object}
   */
  get validationSchema() {
    return Joi.object().keys({
      eventLevel: Joi.string().required().allow([AbstractEvent.FRAMEWORK_EVENT_LEVEL]),
      service: Joi.string().required().allow(AbstractEvent.SERVICES),
      resourceType: Joi.string().required().allow(AbstractEvent.RESOURCE_TYPES),
      resourceId: Joi.string().alphanum().required(),
      eventName: Joi.string().required(),
      eventId: Joi.string().alphanum().optional(),
      time: Joi.number().integer().required(),
      context: Joi.string().required().allow(AbstractEvent.CONTEXTS),
      memoryUsage: Joi.object().unknown().optional().default({}),
      payload: Joi.object().unknown().optional().default({}),
      metadata: Joi.object().unknown().optional().default({}),
      environment: Joi.object().unknown().optional().default({}),
      requestId: Joi.string().alphanum().required(),
      identityId: Joi.string().alphanum().required()
    });
  }
}