/**
 * Created by CCristi <ccovali@mitocgroup.com> on 4/19/16.
 */

'use strict';

import Joi from 'joi';
import {AbstractEvent} from './AbstractEvent';

/**
 * Frontend Event
 */
export class FrontendEvent extends AbstractEvent {
  /**
   * @param {String} args
   */
  constructor(...args) {
    super(...args);
  }

  /**
   * @returns {String}
   */
  getEventLevel() {
    return AbstractEvent.FRONTEND_EVENT_LEVEL;
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
  getValidationSchema() {
    return Joi.object().keys({
      eventLevel: Joi.string().required().allow([AbstractEvent.FRONTEND_EVENT_LEVEL]),
      engine: Joi.string().required().allow(FrontendEvent.ENGINES),
      time: Joi.number().integer().required(),
      context: Joi.string().required().allow([AbstractEvent.FRONTEND_CONTEXT]),
      environment: Joi.object().unknown().optional().default({}),
      identityId: Joi.string().required(),
      memoryUsage: Joi.object().unknown().optional().default({}),
      metadata: Joi.object().unknown().optional().default({}),
      location: Joi.string().optional()
    });
  }

  /**
   * @param {Object} event
   * @returns {Object}
   * @private
   */
  _enrichWithContextData(event) {
    event = super._enrichWithContextData(event);
    event.location = typeof window !== 'undefined' ? `${window.location.pathname}${window.location.hash}` : null;

    return event;
  }

  /**
   * @returns {String[]}
   */
  static get ENGINES() {
    return [
      'angular',
      'vanilla',
    ];
  }
}
