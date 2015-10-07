/**
 * Created by AlexanderC on 9/23/15.
 */

'use strict';

import OS from 'os';
import FileSystem from 'fs';
import Path from 'path';
import {AbstractDriver} from './AbstractDriver';

export class PathAwareDriver extends AbstractDriver {
  /**
   * @param {String} path
   * @param {Number} port
   */
  constructor(path = PathAwareDriver.DBPath, port = PathAwareDriver.DEFAULT_PORT) {
    super(port);

    this._path = path;
  }

  /**
   * @returns {String}
   */
  get path() {
    return this._path;
  }

  /**
   * @param {String} path
   */
  set path(path) {
    this._path = path;
  }

  /**
   * @returns {String}
   */
  static get DBPath() {
    let dir = Path.join(OS.tmpdir(), this.name);

    // @todo: do it async!
    if (!FileSystem.existsSync(dir)) {
      FileSystem.mkdirSync(dir);
    }

    return dir;
  }
}
