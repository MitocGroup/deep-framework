'use strict';


import {AbstractDriver} from '../../lib.compiled/Driver/AbstractDriver';

export class AbstractDriverMock extends AbstractDriver {
  /**
   * @param {String} msg
   * @param {String} level
   * @param {*} context
   */
  log(msg, level, context) {
    var log = {
      context: context,
      level: level,
      msg: msg,
    };

    return log;
  }
}