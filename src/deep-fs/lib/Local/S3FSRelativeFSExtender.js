/**
 * Created by AlexanderC on 10/27/15.
 */

'use strict';

import path from 'path';
import relativeFs from 'relative-fs';
import fse from 'fs-extra';
import fs from 'fs';
import {_extend as extend} from 'util';
import es6Promise from 'es6-promise';

// Fix missing Promise
es6Promise.polyfill();

export class S3FSRelativeFSExtender {
  /**
   * @param {Object|String} relativeFsPath
   */
  constructor(relativeFsPath) {
    let relativeFsObject = relativeFsPath;

    if (typeof relativeFsObject !== 'object') {
      relativeFsObject = relativeFs.relativeTo(relativeFsPath);
      relativeFsObject._rootFolder = relativeFsPath;
    } else if(!relativeFsObject.hasOwnProperty('_rootFolder')) {
      throw new Error('Missing _rootFolder property from RelativeFS object');
    }

    this._relativeFsObject = relativeFsObject;
  }

  /**
   * @returns {Object}
   */
  get relativeFs() {
    return this._relativeFsObject;
  }

  /**
   * @returns {Object}
   */
  get relativeFsExtended() {
    return extend(this._relativeFsObject, this.EXTEND_OBJECT);
  }

  /**
   * @returns {String}
   */
  get cwd() {
    return path.normalize(this._relativeFsObject._rootFolder || process.cwd());
  }

  /**
   * @returns {{getPath: Function, clone: Function, copyFile: Function, create: Function, destroy: Function, headObject: Function, listContents: Function, readdirp: Function, mkdirp: Function, rmdirp: Function}}
   * @constructor
   */
  get EXTEND_OBJECT() {
    let extendObject = {
      bucket: 'relative_fs',
      path: '',
      s3: {}, // @todo: mock `AWS.S3()`

      /**
       * @param {String} pathStr
       * @returns {String}
       *
       * @todo: return some fake bucket name? or the prefix?
       */
      getPath: (pathStr = '') => {
        return path.join(this.cwd, pathStr);
      },

      /**
       * @param {String} pathStr
       * @returns {Object}
       */
      clone: (pathStr) => {
        let newCwd = path.join(this.cwd, pathStr);

        return new S3FSRelativeFSExtender(newCwd).relativeFsExtended;
      },

      /**
       * @param {String} sourcePath
       * @param {String} destinationPath
       * @param {Function|null} callback
       * @returns {Promise|undefined}
       */
      copyFile: (sourcePath, destinationPath, callback = null) => {
        let absSourcePath = path.join(this.cwd, sourcePath);
        let absDestinationPath = path.join(this.cwd, destinationPath);

        if (callback) {
          fse.copy(absSourcePath, absDestinationPath, callback);
          return;
        }

        return new Promise((resolve, reject) => {
          fse.copy(absSourcePath, absDestinationPath, (error) => {
            if (error) {
              reject(error);
              return;
            }

            resolve();
          });
        });
      },

      /**
       * @param {Object} options
       * @param {Function|null} callback
       * @returns {Promise|undefined}
       */
      create: (options, callback = null) => {
        let error = new Error(`You do not have rights for this operation on bucket ${options.Bucket}`);

        if (callback) {
          callback(error);
          return;
        }

        return new Promise((resolve, reject) => {
          reject(error);
        });
      },

      /**
       * @param {Function|null} callback
       * @returns {Promise|undefined}
       */
      destroy: (callback = null) => {
        let error = new Error('You do not have rights for this operation');

        if (callback) {
          fse.remove(this.cwd, () => {
            callback(error);
          });
          return;
        }

        return new Promise((resolve, reject) => {
          fse.remove(this.cwd, (nativeError) => {
            if (nativeError) {
              reject(nativeError);
              return;
            }

            reject(error);
          });
        });
      },

      /**
       * @param {String} pathStr
       * @param {Function|null} callback
       * @returns {Promise|undefined}
       */
      headObject: (pathStr, callback = null) => {
        let responseObj = {
          AcceptRanges: '',
          Restore: '',
          LastModified: new Date().getTime(),
          ContentLength: 0,
          ETag: '55ad340609f4b302',
          MissingMeta: 0,
          VersionId: '55ad340609f4b302',
          StorageClass: 'REDUCED_REDUNDANCY',
        };

        if (callback) {
          callback(responseObj);
          return;
        }

        return new Promise((resolve) => {
          resolve(responseObj);
        });
      },

      /**
       * @param {String} pathStr
       * @param {String} marker
       * @param {Function|null} callback
       * @returns {Promise|undefined}
       */
      listContents: (pathStr, marker, callback = null) => {
        let absPath = path.join(this.cwd, pathStr);

        let globResponseObj = {
          Marker: marker,
          IsTruncated: false,
          Contents: [],
          Name: this.cwd,
          Prefix: pathStr,
          Delimiter: '/',
          MaxKeys: 1000000000,
          CommonPrefixes: [],
          EncodingType: 'url',
        };

        let responseObj = {
          Key: null,
          LastModified: new Date().getTime(),
          Size: 0,
          ETag: '55ad340609f4b302',
          StorageClass: 'REDUCED_REDUNDANCY',
          Owner: {
            DisplayName: 's3fs',
            ID: '55ad340609f4b302',
          },
        };

        if (callback) {
          fse.walk(absPath)
            .on('data', (item) => {
              globResponseObj.Contents.push(extend(responseObj, {Key: item.path.substr(this.cwd.length)}));
            })
            .on('end', () => {
              callback(globResponseObj);
            });

          return;
        }

        return new Promise((resolve) => {
          fse.walk(absPath)
            .on('data', (item) => {
              globResponseObj.Contents.push(extend(responseObj, {Key: item.path.substr(this.cwd.length)}));
            })
            .on('end', () => {
              resolve(globResponseObj);
            });
        });
      },

      /**
       * @param {String} pathStr
       * @param {Function|null} callback
       * @returns {Promise|undefined}
       */
      readdirp: (pathStr, callback = null) => {
        let absPath = path.join(this.cwd, pathStr);

        if (callback) {
          try {
            callback(null, S3FSRelativeFSExtender._readdirp(absPath, this.cwd));
          } catch(error) {
            callback(error, null);
          }

          return;
        }

        return new Promise((resolve, reject) => {
          try {
            resolve(S3FSRelativeFSExtender._readdirp(absPath, this.cwd));
          } catch(error) {
            reject(error);
          }
        });
      },

      /**
       * @param {String} pathStr
       * @param {Function|null} callback
       * @returns {Promise|undefined}
       */
      mkdirp: (pathStr, callback = null) => {
        let absPath = path.join(this.cwd, pathStr);

        if (callback) {
          fse.mkdirp(absPath, callback);
          return;
        }

        return new Promise((resolve, reject) => {
          fse.mkdirp(absPath, (error) => {
            if (error) {
              reject(error);
              return;
            }

            resolve();
          });
        });
      },

      /**
       * @param {String} pathStr
       * @param {Function|null} callback
       * @returns {Promise|undefined}
       */
      rmdirp: (pathStr, callback = null) => {
        let absPath = path.join(this.cwd, pathStr);

        if (callback) {
          fse.remove(absPath, callback);
          return;
        }

        return new Promise((resolve, reject) => {
          fse.remove(absPath, (error) => {
            if (error) {
              reject(error);
              return;
            }

            resolve();
          });
        });
      },

      /**
       * @param {String} pathStr
       * @param {String} content
       * @param {Function} callback
       * @returns {Promise|undefined}
       */
      writeFile: (pathStr, content, callback) => {
        let absPath = path.join(this.cwd, pathStr);

        if (callback) {
          fse.outputFile(absPath, content, callback);
          return;
        }

        return new Promise((resolve, reject) => {
          fse.outputFile(absPath, content, error => {
            if (error) {
              reject(error);
              return;
            }

            resolve();
          });
        });
      }
    };

    extendObject.copyDir = extendObject.copyFile;
    extendObject.delete = extendObject.create;
    extendObject.putBucketLifecycle = extendObject.create;

    return extendObject;
  }

  /**
   * @param {String} dir
   * @param {String} basePath
   * @returns {String[]}
   * @private
   */
  static _readdirp(dir, basePath = null) {
    let _files = [];

    let files = fs.readdirSync(dir);

    for (let i in files) {
      if (!files.hasOwnProperty(i)) {
        continue;
      }

      let file = path.join(dir, files[i]);

      _files.push(file);

      if (fs.statSync(file).isDirectory()) {
        _files = _files.concat(
          S3FSRelativeFSExtender._readdirp(file)
        );
      }
    }

    return basePath
      ? _files.map((file) => file.substr(basePath.length))
      : _files;
  }

  /**
   * @param {String} dir
   * @returns {S3FSRelativeFSExtender}
   */
  addReadonlyDirectory(dir) {
    S3FSRelativeFSExtender.READ_METHODS.forEach(method => {
      let originalMethod = this._relativeFsObject[method];

      this._relativeFsObject[method] = (...args) => {
        let originalPath = args.shift();
        let originalCb = args.pop();

        originalMethod(originalPath, ...args, (error, data) => {
          if (error && error.code === 'ENOENT') {
            let absPath = path.join(dir, originalPath);

            return fs[method](absPath, ...args, originalCb);
          }

          originalCb(error, data);
        })
      }
    });
    
    return this;
  }

  /**
   * @returns {String[]}
   */
  static get READ_METHODS() {
    return ['readFile'];
  }
}
