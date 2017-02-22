/**
 * Created by AlexanderC on 2/22/17.
 */

'use strict';

import {AbstractDriver} from './AbstractDriver';

export class ConsoleDriver extends AbstractDriver {
  /**
   * @param   {String} name
   * @param   {*} data
   * @param   {Object} context
   *
   * @returns {Promise|*}
   *
   * @private
   */
  _log(name, data, context) {
    return this._printEvent(name, data, context);
  }
}
