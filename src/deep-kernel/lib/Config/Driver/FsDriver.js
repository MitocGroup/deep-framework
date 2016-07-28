/**
 * Created by AlexanderC on 3/7/16.
 */

'use strict';

import {AbstractDriver} from './AbstractDriver';
import fs from 'fs';

export class FsDriver extends AbstractDriver {
  /**
   * @param {String} file
   */
  constructor(file = null) {
    super();

    this._fs = fs;
    this._file = file;
  }

  /**
   * @returns {String}
   */
  get file() {
    return this._file;
  }

  /**
   * @returns {fs|s3fs|*}
   */
  get fs() {
    return this._fs;
  }

  /**
   * @param {fs|s3fs|*} fs
   * @returns {FsDriver}
   */
  setFs(fs) {
    this._fs = fs;

    return this;
  }

  /**
   * @param {String} file
   * @returns {FsDriver}
   */
  setFile(file) {
    this._file = file;

    return this;
  }

  /**
   * @param {String} file
   * @private
   */
  _load(file = null) {
    this._file = file || this._file;

    this._fs.readFile(this._file, (error, data) => {
      let configStr = data ? data.toString() : '{}';

      if (error && error.name !== 'NoSuchKey') {
        this.fail(`Error reading configuration file '${this._file}': ${error}`);

        return;
      }

      this.loadedJson(configStr);
    });
  }
}
