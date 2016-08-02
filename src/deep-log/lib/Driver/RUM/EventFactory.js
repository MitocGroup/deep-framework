/**
 * Created by CCristi <ccovali@mitocgroup.com> on 4/19/16.
 */

'use strict';

import {FrameworkEvent} from './FrameworkEvent';
import {FrontendEvent} from './FrontendEvent';
import {AbstractEvent} from './AbstractEvent';
import {UnknownRumEventException} from '../Exception/UnknownRumEventException';

/**
 * Event Factory
 */
export class EventFactory {
  /**
   * @param {Object} kernel
   * @param {Object} rawData
   * @returns {EventClass}
   */
  static create(kernel, rawData) {
    let EventClass = null;

    // @note - For the time being event type is guessed by event.service
    // (it'll be changed once we'll have other types of events)
    if (rawData.service && AbstractEvent.SERVICES.indexOf(rawData.service) !== -1) {
      EventClass = FrameworkEvent;
    } else if (rawData.engine) {
      EventClass = FrontendEvent;
    } else {
      throw new UnknownRumEventException(rawData);
    }

    return new EventClass(kernel, rawData);
  }
}
