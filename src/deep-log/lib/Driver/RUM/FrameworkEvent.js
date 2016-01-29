/**
 * Created by mgoria on 1/29/16.
 */

'use strict';

import {AbstractEvent} from './AbstractEvent';

/**
 * Framework event level
 */
export class FrameworkEvent extends AbstractEvent {
  constructor(...args) {
    super(...args);
  }

  toJSON() {
    return this.validate();
  }
}