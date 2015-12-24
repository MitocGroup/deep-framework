/**
 * Created by AlexanderC on 6/15/15.
 */

'use strict';

import {AbstractDriver} from './AbstractDriver';
import {Log} from '../Log';
import Raven from 'raven';
import url from 'url';
import util from 'util';

/**
 * Raven/Sentry logging for browser
 *
 * @todo replace it on compile time rather than runtime!
 */
export class RavenBrowserDriver extends AbstractDriver {
  /**
   * @param {String} dsn
   * @param {Object} options
   */
  constructor(dsn, options = {}) {
    super();

    options = util._extend(options, {
      maxMessageLength: 256
    });

    Raven.config(RavenBrowserDriver._prepareDsn(dsn), options).install();
  }

  /**
   * @todo: tmp hook, remove it before persisting frontend config
   *
   * Remove password from url to not expose it into browser
   *
   * @param {String} dsn
   * @returns {String}
   */
  static _prepareDsn(dsn) {
    let parsedDsn = url.parse(dsn);
    parsedDsn.auth = parsedDsn.auth.split(':')[0];

    return url.format(parsedDsn);
  }

  /**
   * @param {String} msg
   * @param {String} level
   * @param {*} context
   */
  log(msg, level, context) {
    let nativeLevel = RavenBrowserDriver._mapLevel(level);


    Raven.captureMessage(msg, {
      level: nativeLevel,
      extra: context,
      tags: {
        originalLevel: level,
      },
    });
  }

  /**
   * @param {String} level
   * @returns {string}
   * @private
   */
  static _mapLevel(level) {
    let nativeLevel = 'info';

    switch (level) {
      case Log.EMERGENCY:
      case Log.CRITICAL:
        nativeLevel = 'fatal';
        break;
      case Log.ALERT:
      case Log.WARNING:
      case Log.NOTICE:
        nativeLevel = 'warning';
        break;
      case Log.ERROR:
        nativeLevel = 'error';
        break;
      case Log.INFO:
        nativeLevel = 'info';
        break;
      case Log.DEBUG:
        nativeLevel = 'debug';
        break;
    }

    return nativeLevel;
  }
}
