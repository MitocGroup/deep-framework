/**
 * Created by AlexanderC on 1/21/16.
 */

//need for backward compatibility with node v0.10.x
/*eslint no-eq-null: 0, eqeqeq: 0*/

'use strict';

import util from 'util';

export class Registry {
  /**
   * @param {AWS.S3} s3
   * @param {String} bucket
   * @param {String} registryFile
   */
  constructor(s3, bucket, registryFile = Registry.REGISTRY_FILE) {
    this._s3 = s3;
    this._bucket = bucket;
    this._registryFile = registryFile;

    this._registry = null;
    this._lastModified = null;
    this._ensureFresh = Registry.ENSURE_FRESH;
  }

  /**
   * @param {FS|*} fs
   * @param {String} registryFile
   * @returns {Registry}
   */
  static createFromFS(fs, registryFile = Registry.REGISTRY_FILE) {
    return new Registry(
      fs.s3,
      fs.bucket,
      fs.getPath(registryFile)
    );
  }

  /**
   * @param {Function} cb
   * @returns {Registry}
   */
  keys(cb) {
    this._ensureLoaded((error) => {
      if (error) {
        cb(error, null);
        return;
      }

      cb(null, Object.keys(this._registry));
    });

    return this;
  }

  /**
   * @param {String} key
   * @param {Function} cb
   * @returns {Registry}
   */
  read(key, cb) {
    this._ensureLoaded((error) => {
      if (error) {
        cb(error, null);
        return;
      }

      if (this._registry.hasOwnProperty(key)) {
        cb(null, this._registry[key]);
        return;
      }

      cb(new Error(`Missing registry entry '${key}'`), null);
    });

    return this;
  }

  /**
   * @param {String} key
   * @param {Function} cb
   * @returns {Registry}
   */
  exists(key, cb) {
    this._ensureLoaded((error) => {
      if (error) {
        cb(error, null);
        return;
      }

      cb(null, this._registry.hasOwnProperty(key));
    });

    return this;
  }

  /**
   * @param {String} key
   * @param {*} data
   * @param {Function} cb
   * @returns {Registry}
   */
  write(key, data, cb) {
    this._ensureLoaded((error) => {
      if (error) {
        cb(error);
        return;
      }

      let hadKey = this._registry.hasOwnProperty(key);
      let oldValue = this._registry[key];

      this._registry[key] = data;

      this._persist((error) => {
        if (error) {
          if (hadKey) {
            this._registry[key] = oldValue;
          } else {
            delete this._registry[key];
          }
        }

        cb(error);
      });
    });

    return this;
  }

  /**
   * @param {Function} cb
   * @returns {Registry}
   */
  refresh(cb) {
    this._readS3Object(
      this._registryFile,
      (error, rawRegistry, lastModified) => {
        if (error && error.code !== 'NoSuchKey') {
          cb(error);
          return;
        }

        if (rawRegistry) {
          try {
            this._registry = Registry._decodeRegistry(rawRegistry);
            this._lastModified = lastModified;
          } catch (error) {
            cb(error);
            return;
          }
        }

        cb(null);
      },
      this._lastModified
    );

    return this;
  }

  /**
   * @param {Function} cb
   * @private
   */
  _persist(cb) {
    this._writeS3Object(
      this._registryFile,
      Registry._encodeRegistry(this._registry),
      cb
    );
  }

  /**
   * @param {Function} cb
   * @private
   */
  _ensureLoaded(cb) {
    if (this._registry === null || this._ensureFresh) {
      this.refresh((error) => {
        this._registry = this._registry || {};

        cb(error);
      });
    } else {
      cb(null);
    }
  }

  /**
   * @param {String} rawRegistry
   * @returns {Object}
   * @private
   */
  static _decodeRegistry(rawRegistry) {
    let registry = {};
    let registryObj = JSON.parse(rawRegistry);

    for (let key in registryObj) {
      if (!registryObj.hasOwnProperty(key)) {
        continue;
      }

      registry[key] = Registry._decodeValue(registryObj[key]);
    }

    return registry;
  }

  /**
   * @param {Object} registry
   * @returns {String}
   * @private
   */
  static _encodeRegistry(registry) {
    let registryObj = {};

    for (let key in registry) {
      if (!registry.hasOwnProperty(key)) {
        continue;
      }

      registryObj[key] = Registry._encodeValue(registry[key]);
    }

    return JSON.stringify(registryObj);
  }

  /**
   * @param {String} key
   * @param {Function} cb
   * @param {Date|null} lastModified
   * @private
   */
  _readS3Object(key, cb, lastModified = null) {
    let payload = {
      Bucket: this._bucket,
      Key: key,
    };

    if (lastModified) {
      payload.IfModifiedSince = lastModified;
    }

    this._s3.getObject(payload, (error, data) => {
      if (error) {

        // when the object is not modified
        if (lastModified && error.code === 'NotModified') {
          cb(null, null, null);
          return;
        }

        cb(error, null, null);
        return;
      }

      let result = null;
      let resultLastModified = lastModified;

      if (data && data.Body) {
        result = data.Body.toString();

        resultLastModified = typeof data.LastModified === 'string' ?
          new Date(data.LastModified) :
          data.LastModified;
      }

      cb(null, result, resultLastModified);
    });
  }

  /**
   * @param {String} key
   * @param {*} content
   * @param {Function} cb
   * @private
   */
  _writeS3Object(key, content, cb) {
    let payload = {
      Bucket: this._bucket,
      Key: key,
      Body: content.toString(),
    };

    this._s3.putObject(payload, (error) => {
      cb(error);
    });
  }

  /**
   * @param {*} value
   * @returns {{t: string, v: *}}
   * @private
   */
  static _encodeValue(value) {
    let type = 'plain';
    let val = value;

    if (util.isArray(value)) {
      type = 'arr';
      val = JSON.stringify(value);
    } else if(Buffer.isBuffer(value)) {
      val = value.toString();
    } else if(Registry.isObject(value)) {
      type = 'obj';
      val = JSON.stringify(value);
    }

    return {
      t: type,
      v: val,
    };
  }

  /**
   * @param {*} obj
   * @returns {boolean}
   */
  static isObject(obj) {
    return obj != null && typeof obj === 'object' && !Array.isArray(obj);
  }

  /**
   * @param {Object} valueObj
   * @returns {*}
   * @private
   */
  static _decodeValue(valueObj) {
    let value = null;

    switch (valueObj.t) {
      case 'arr':
      case 'obj':
        value = JSON.parse(valueObj.v);
        break;
      default: value = valueObj.v;
    }

    return value;
  }

  /**
   * @param {Boolean} state
   */
  set ensureFresh(state) {
    this._ensureFresh = state;
  }

  /**
   * @returns {Boolean}
   */
  get ensureFresh() {
    return this._ensureFresh;
  }

  /**
   * @returns {Date}
   */
  get lastModified() {
    return this._lastModified;
  }

  /**
   * @returns {String}
   */
  get registryFile() {
    return this._registryFile;
  }

  /**
   * @returns {String}
   */
  get bucket() {
    return this._bucket;
  }

  /**
   * @returns {AWS.S3}
   */
  get s3() {
    return this._s3;
  }

  /**
   * @returns {Boolean}
   */
  static get ENSURE_FRESH() {
    return true;
  }

  /**
   * @returns {String}
   */
  static get REGISTRY_FILE() {
    return '__deep_registry__';
  }
}
