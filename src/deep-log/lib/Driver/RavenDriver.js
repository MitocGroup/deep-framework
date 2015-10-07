/**
 * Created by AlexanderC on 6/15/15.
 */

'use strict';

import {AbstractDriver} from './AbstractDriver';
import {Log} from '../Log';
import Raven from 'raven';

/**
 * Raven/Sentry logging
 */
export class RavenDriver extends AbstractDriver {
  /**
   * @param {String} dsn
   */
  constructor(dsn) {
    super();

    this._clients = {};

    for (let levelKey in Log.LEVELS) {
      if (!Log.LEVELS.hasOwnProperty(levelKey)) {
        continue;
      }

      let level = Log.LEVELS[levelKey];

      let nativeLevel = RavenDriver._mapLevel(level);

      this._clients[nativeLevel] = new Raven.Client(dsn, {
        level: nativeLevel,
      });
    }
  }

  /**
   * @returns {Raven.Client[]}
   */
  get clients() {
    return this._clients;
  }

  /**
   * @param {String} msg
   * @param {String} level
   * @param {*} context
   */
  log(msg, level, context) {
    let nativeLevel = RavenDriver._mapLevel(level);

    this._clients[nativeLevel].captureMessage(msg, {
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
