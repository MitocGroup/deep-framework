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
   * @param {String} privateFsBucket
   * @param {String} sharedFsBucket
   */
  constructor(tmpFsBucket = null, publicFsBucket = null, privateFsBucket = null, sharedFsBucket = null) {
    super();

    this._mountedFolders = {};
    this._buckets = {};

    this._buckets[FS.TMP] = tmpFsBucket;
    this._buckets[FS.PUBLIC] = publicFsBucket;
    this._buckets[FS.PRIVATE] = privateFsBucket;
    this._buckets[FS.SHARED] = sharedFsBucket;

    this._sourcePath = null;
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
      this._registry = Registry.createFromFS(this.private);
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
  static get PRIVATE() {
    return 'private';
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
      FS.PRIVATE,
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
        case FS.PRIVATE:
          this._buckets[folder] = `${bucketsConfig[FS.PRIVATE].name}/${folder}/${kernel.microservice().identifier}`;
          break;
        case FS.SHARED:
          this._buckets[folder] = `${bucketsConfig[FS.PRIVATE].name}/${folder}`;
          break;
        case FS.PUBLIC:
          let publicBucketObj = bucketsConfig[folder];

          this._buckets[folder] = `${publicBucketObj.name}/${kernel.microservice().identifier}`;
          this._sourcePath = publicBucketObj.sourcePath;
          break;
        default:
          this._buckets[folder] = `${bucketsConfig[folder].name}/${kernel.microservice().identifier}`;
      }
    }

    callback();
  }

  /**
   * Returns mounted file private folder (tmp, public or private)
   *
   * @param {String} name
   * @param {String} msIdentifier
   * @returns {fs|s3fs|S3FS|S3FsRumProxy|SimulatedS3FS|*}
   */
  getFolder(name, msIdentifier = null) {
    if (FS.FOLDERS.indexOf(name) === -1) {
      throw new UnknownFolderException(name, FS.FOLDERS);
    }

    let realName = null;

    if (name === FS.SHARED) {
      if (!msIdentifier) {
        throw new Exception('You must provide a microservice identifier for the shared fs');
      }

      // validate msIdentifier
      msIdentifier = this.kernel.microservice(msIdentifier).identifier;

      realName = `${name}.${msIdentifier}`;
    }

    if (typeof this._mountedFolders[realName || name] === 'undefined') {
      if (this._localBackend) {
        let rootFolder = FS._getTmpDir(this._buckets[name]);
        let SimulatedS3FS = require('./Local/S3FSRelativeFSExtender').S3FSRelativeFSExtender;

        let simulatedS3FS = new SimulatedS3FS(rootFolder); // relativeFsExtended

        if (name === FS.PUBLIC && this._sourcePath) {
          simulatedS3FS.addReadonlyDirectory(this._sourcePath);
        }

        this._mountedFolders[realName || name] = simulatedS3FS.relativeFsExtended;
      } else if (name === FS.SHARED) {
        let s3Fs = this._mountedFolders[name];

        if (typeof s3Fs === 'undefined') {
          s3Fs = new S3FS(this._buckets[name], {});

          if (this.kernel && this.kernel.isRumEnabled) {
            s3Fs = new S3FsRumProxy(s3Fs, this.kernel.get('log')).proxy();
          }

          this._mountedFolders[name] = s3Fs;
        }

        this._mountedFolders[realName] = s3Fs.clone(msIdentifier);
      } else {
        let s3Fs = new S3FS(this._buckets[name], {});

        if (this.kernel && this.kernel.isRumEnabled) {
          s3Fs = new S3FsRumProxy(s3Fs, this.kernel.get('log')).proxy();
        }

        this._mountedFolders[name] = s3Fs;
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
   * @param {Microservice|String|*} microservice
   * @returns {fs|s3fs|S3FS|S3FsRumProxy|SimulatedS3FS|*}
   */
  shared(microservice = null) {
    microservice = microservice || this.kernel.microservice();

    let msIdentifier = typeof microservice === 'string' ? microservice : microservice.identifier;

    return this.getFolder(FS.SHARED, msIdentifier);
  }

  /**
   * Returns mounted tmp folder
   *
   * @returns {fs|s3fs|S3FS|S3FsRumProxy|SimulatedS3FS|*}
   */
  get tmp() {
    return this.getFolder(FS.TMP);
  }

  /**
   * Returns mounted public folder
   *
   * @returns {fs|s3fs|S3FS|S3FsRumProxy|SimulatedS3FS|*}
   */
  get public() {
    return this.getFolder(FS.PUBLIC);
  }

  /**
   * Returns mounted system folder
   * @deprecated
   * @returns {fs|s3fs|S3FS|S3FsRumProxy|SimulatedS3FS|*}
   */
  get system() {
    return this.getFolder(FS.PRIVATE);
  }

  /**
   * Returns mounted system folder
   *
   * @returns {fs|s3fs|S3FS|S3FsRumProxy|SimulatedS3FS|*}
   */
  get private() {
    return this.getFolder(FS.PRIVATE);
  }
}
