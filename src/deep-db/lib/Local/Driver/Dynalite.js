/**
 * Created by AlexanderC on 9/23/15.
 */

'use strict';

import {PathAwareDriver} from './PathAwareDriver';
import DynaliteServer from 'dynalite';
import {FailedToStartServerException} from './Exception/FailedToStartServerException';

export class Dynalite extends PathAwareDriver {
  /**
   * @param {Object} options
   * @param {String} path
   * @param {Number} port
   */
  constructor(options = Dynalite.DEFAULT_OPTIONS, path = Dynalite.DBPath, port = Dynalite.DEFAULT_PORT) {
    super(path, port);

    this._options = options;
    this._server = null;
  }

  /**
   * @returns {Object}
   */
  get options() {
    return this._options;
  }

  /**
   * @param {Function} cb
   * @private
   */
  _start(cb) {
    this._options.path = this.path;

    this._server = DynaliteServer(this._options);

    this._server.listen(this.port, (error) => {
      if (error) {
        cb(new FailedToStartServerException(this, error));
        return;
      }

      cb(null);
    });
  }

  /**
   * @param {Function} cb
   * @private
   */
  _stop(cb) {
    if (this._server) {
      this._server.close(cb);
      this._server = null;

      return;
    }

    cb(null);
  }

  /**
   * @returns {Object}
   */
  static get DEFAULT_OPTIONS() {
    return {
      createTableMs: 0,
      deleteTableMs: 0,
      updateTableMs: 0,
    };
  }
}
