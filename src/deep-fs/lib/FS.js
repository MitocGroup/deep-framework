/**
 * Created by mgoria on 5/28/15.
 */

'use strict';

import S3FS from 's3fs';
import Kernel from 'deep-kernel';
import {UnknownFolderException} from './Exception/UnknownFolderException';
import {Exception} from './Exception/Exception';
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
   * @param {String} sharedFsBucket
   */
  constructor(tmpFsBucket = null, publicFsBucket = null, systemFsBucket = null, sharedFsBucket = null) {
    super();

    this._mountedFolders = {};
    this._buckets = {};

    this._buckets[FS.TMP] = tmpFsBucket;
    this._buckets[FS.PUBLIC] = publicFsBucket;
    this._buckets[FS.SYSTEM] = systemFsBucket;
    this._buckets[FS.SHARED] = sharedFsBucket;

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
    if (!this._registry) {
      this._registry = Registry.createFromFS(this.system);
    }

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
   * @returns {String}
   */
  static get SHARED() {
    return 'shared';
  }

  /**
   * @returns {Array}
   */
  static get FOLDERS() {
    return [
      FS.TMP,
      FS.SYSTEM,
      FS.SHARED,
      FS.PUBLIC,
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

    for (let i in FS.FOLDERS) {
      if (!FS.FOLDERS.hasOwnProperty(i)) {
        continue;
      }

      let folder = FS.FOLDERS[i];

      switch (folder) {
        case FS.TMP:
        case FS.SYSTEM:
          this._buckets[folder] = `${bucketsConfig[FS.SYSTEM].name}/${folder}/${kernel.microservice().identifier}`;
          break;
        case FS.SHARED:
          this._buckets[folder] = `${bucketsConfig[FS.SYSTEM].name}/${folder}`;
          break;
        default:
          this._buckets[folder] = `${bucketsConfig[folder].name}/${kernel.microservice().identifier}`;
      }
    }

    callback();
  }

  /**
   * Returns mounted file system folder (tmp, public or system)
   *
   * @param {String} name
   * @param {String} msIdentifier
   * @returns {S3FS|s3fs|SimulatedS3FS|*}
   */
  getFolder(name, msIdentifier = null) {
    if (FS.FOLDERS.indexOf(name) === -1) {
      throw new UnknownFolderException(name, FS.FOLDERS);
    }

    let realName = null;

    if (name === FS.SHARED) {
      if (!msIdentifier) {
        throw new Exception(`You must provide a microservice identifier for the shared fs`);
      }

      // validate msIdentifier
      msIdentifier = this.kernel.microservice(msIdentifier).identifier;

      realName = `${name}.${msIdentifier}`;
    }

    if (typeof this._mountedFolders[realName || name] === 'undefined') {
      if (this._localBackend) {
        let rootFolder = FS._getTmpDir(this._buckets[name]);
        let SimulatedS3FS = require('./Local/S3FSRelativeFSExtender').S3FSRelativeFSExtender;

        this._mountedFolders[name] = new SimulatedS3FS(rootFolder).relativeFsExtended;
      } else {
        let s3Fs = new S3FS(this._buckets[name], {});

        if (this.kernel instanceof Kernel) {
          let logService = this.kernel.get('log');

          if (logService.isRumEnabled()) {
            s3Fs = new S3FsRumProxy(s3Fs, logService).proxy();
          }
        }

        if (name === FS.SHARED) {
          s3Fs = s3Fs.clone(msIdentifier);
        }

        this._mountedFolders[realName || name] = s3Fs;
      }
    }

    return this._mountedFolders[realName || name];
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
   * Returns mounted shared folder
   *
   * @returns {s3fs|S3FS|S3FsRumProxy|SimulatedS3FS|*}
   */
  shared(msIdentifier = null) {
    return this.getFolder(FS.SHARED, msIdentifier || this._mainMsIdentifier);
  }

  /**
   * @returns {Service.identifier|String}
   * @private
   */
  get _mainMsIdentifier() {
    return this.kernel.microservice().identifier;
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
