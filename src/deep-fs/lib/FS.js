/**
 * Created by mgoria on 5/28/15.
 */

'use strict';

import S3FS from 's3fs';
import Kernel from 'deep-kernel';
import {UnknownFolderException} from './Exception/UnknownFolderException';
import OS from 'os';
import Path from 'path';
import {Registry} from './Registry';
import {S3FsRumProxy} from './S3FsRumProxy';

/**
 * Deep FS implementation
 */
export class FS extends Kernel.ContainerAware {
  /**
   * Defines all class private properties
   *
   * @param {String} tmpFsBucket
   * @param {String} publicFsBucket
   * @param {String} systemFsBucket
   */
  constructor(tmpFsBucket = null, publicFsBucket = null, systemFsBucket = null) {
    super();

    this._mountedFolders = {};
    this._buckets = {};

    this._buckets[FS.TMP] = tmpFsBucket;
    this._buckets[FS.PUBLIC] = publicFsBucket;
    this._buckets[FS.SYSTEM] = systemFsBucket;

    this._registry = null;
  }

  /**
   * @returns {Registry}
   * @constructor
   */
  static get RegistryInstance() {
    return Registry;
  }

  /**
   * @returns {Registry}
   */
  get registry() {
    return this._registry;
  }

  /**
   * @returns {string}
   */
  static get TMP() {
    return 'temp';
  }

  /**
   * @returns {string}
   */
  static get PUBLIC() {
    return 'public';
  }

  /**
   * @returns {string}
   */
  static get SYSTEM() {
    return 'system';
  }

  /**
   * @returns {Array}
   */
  static get FOLDERS() {
    return [
      FS.TMP,
      FS.PUBLIC,
      FS.SYSTEM,
    ];
  }

  /**
   * Booting a certain service
   *
   * @param {Kernel} kernel
   * @param {Function} callback
   */
  boot(kernel, callback) {
    let bucketsConfig = kernel.config.buckets;

    for (let folderKey in FS.FOLDERS) {
      if (!FS.FOLDERS.hasOwnProperty(folderKey)) {
        continue;
      }

      let folder = FS.FOLDERS[folderKey];

      this._buckets[folder] = `${bucketsConfig[folder].name}/${kernel.microservice().identifier}`;
    }

    this._registry = Registry.createFromFS(this.system);

    callback();
  }

  /**
   * Returns mounted file system folder (tmp, public or system)
   *
   * @param name
   * @returns {*}
   */
  getFolder(name) {
    if (FS.FOLDERS.indexOf(name) === -1) {
      throw new UnknownFolderException(name, FS.FOLDERS);
    }

    if (typeof this._mountedFolders[name] === 'undefined') {
      if (this._localBackend) {
        let rootFolder = FS._getTmpDir(this._buckets[name]);
        let SimulatedS3FS = require('./Local/S3FSRelativeFSExtender').S3FSRelativeFSExtender;

        this._mountedFolders[name] = new SimulatedS3FS(rootFolder).relativeFsExtended;
      } else {
        let options = {
          params: {
            Bucket: this._buckets[name],
          },
        };

        let logService = this.kernel.get('log');
        let s3Fs = new S3FS(this._buckets[name], options);

        if (logService.isRumEnabled()) {
          s3Fs = new S3FsRumProxy(s3Fs, logService).proxy();
        }

        this._mountedFolders[name] = s3Fs;
      }
    }

    return this._mountedFolders[name];
  }

  /**
   * @param {String} subpath
   * @returns {String}
   * @private
   */
  static _getTmpDir(subpath) {
    let dir = Path.join(OS.tmpdir(), subpath);

    require('fs-extra').mkdirpSync(dir);

    return dir;
  }

  /**
   * Returns mounted tmp folder
   *
   * @returns {*}
   */
  get tmp() {
    return this.getFolder(FS.TMP);
  }

  /**
   * Returns mounted public folder
   *
   * @returns {*}
   */
  get public() {
    return this.getFolder(FS.PUBLIC);
  }

  /**
   * Returns mounted sys folder
   *
   * @returns {*}
   */
  get system() {
    return this.getFolder(FS.SYSTEM);
  }
}
