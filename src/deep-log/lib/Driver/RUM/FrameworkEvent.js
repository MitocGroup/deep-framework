/**
 * Created by mgoria on 1/29/16.
 */

'use strict';

import {AbstractEvent} from './AbstractEvent';
import frameworkEventSchema from './frameworkevent.schema';

/**
 * Framework event level
 */
export class FrameworkEvent extends AbstractEvent {
  constructor(...args) {
    super(...args);
  }

  /**
   * @returns {Object}
   */
  get validationSchema() {
    return frameworkEventSchema;
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
}