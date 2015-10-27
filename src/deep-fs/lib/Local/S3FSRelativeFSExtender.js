/**
 * Created by AlexanderC on 10/27/15.
 */

'use strict';

import path from 'path';
import relativeFs from 'relative-fs';
import fse from 'fs-extra';
import fs from 'fs';
import {_extend as extend} from 'util';

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
    return this._relativeFsObject._rootFolder || process.cwd();
  }

  /**
   * @returns {Object}
   */
  get EXTEND_OBJECT() {
    let extendObject = {

      /**
       * @param {String} pathStr
       * @returns {String}
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
          fse.copy(sourcePath, destinationPath, callback);
          return;
        }

        return new Promise((resolve, reject) => {
          fse.copy(sourcePath, destinationPath, (error) => {
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
        let error = new Error(`You do not have rights for this operation on bucket ${options.Bucket}`);

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

        return new Promise((resolve, reject) => {
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
          let items = [];

          fse.walk(absPath)
            .on('data', (item) => {
              globResponseObj.Contents.push(extend(responseObj, {Key: item.path}));
            })
            .on('end', () => {
              callback(globResponseObj);
            });

          return;
        }

        return new Promise((resolve, reject) => {
          fse.walk(absPath)
            .on('data', (item) => {
              globResponseObj.Contents.push(extend(responseObj, {Key: item.path}));
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
          fs.readdir(absPath, callback);
          return;
        }

        return new Promise((resolve, reject) => {
          fs.readdir(absPath, (error, files) => {
            if (error) {
              reject(error);
              return;
            }

            resolve(files);
          });
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
      }
    };

    extendObject.copyDir = extendObject.copyFile;
    extendObject.delete = extendObject.create;
    extendObject.putBucketLifecycle = extendObject.create;

    return extendObject;
  }
}
