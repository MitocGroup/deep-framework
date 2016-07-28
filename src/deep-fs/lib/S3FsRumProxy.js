/**
 * Created by mgoria on 2/3/16.
 */

'use strict';

import util from 'util';

/**
 * Proxy S3FS library
 */
export class S3FsRumProxy {
  /**
   * @param {Object} originalInstance
   * @param {Object} logService
   */
  constructor(originalInstance, logService) {
    this._originalInstance = originalInstance;
    this._logService = logService;
  }

  /**
   * @returns {Object}
   */
  proxy() {
    let proxy = {};

    for (let property in this._originalInstance) {
      if (typeof this._originalInstance[property] === 'function') {
        let originalFunction = this._originalInstance[property];

        proxy[property] = (...args) => {
          let originalCallback = null;

          // seeking the callback function through the arguments and proxy it
          args.forEach((arg, index) => {
            if (typeof arg === 'function') {
              originalCallback = arg;

              args[index] = (...cbArgs) => {
                this._logRumEvent({
                  eventName: property,
                  payload: {args: cbArgs},
                });

                return originalCallback.call(this._originalInstance, ...cbArgs);
              };
            }
          });

          // proxy only async methods (that have a callback through args)
          if (null !== originalCallback) {
            this._logRumEvent({
              eventName: property,
              payload: {args: args},
            });
          }

          return originalFunction.call(this._originalInstance, ...args);
        };
      } else {
        proxy[property] = this._originalInstance[property];
      }
    }

    return proxy;
  }

  /**
   * @param {Object} customData
   */
  _logRumEvent(customData) {
    let event = util._extend(customData, {
      service: 'deep-fs',
      resourceType: 'S3',
      resourceId: this._originalInstance.bucket,
    });

    this._logService.rumLog(event);
  }
}
