/**
 * Created by mgoria on 2/3/16.
 */

'use strict';

/**
 * Proxy S3FS library
 */
export class S3FsProxy {
  /**
   * @param {Object} originalInstance
   * @returns {Object}
   */
  static create(originalInstance) {
    let proxy = {};

    for (let property in originalInstance) {
      if (typeof originalInstance[property] === 'function') {
        let originalFunction = originalInstance[property];

        proxy[property] = (...args) => {
          let originalCallback = null;

          // seeking the callback function through the arguments and proxy it
          args.forEach((arg, index) => {
            if (typeof arg === 'function') {
              originalCallback = arg;

              args[index] = (...cbArgs) => {
                // @todo - log RUM event
                S3FsProxy.logRumEvent({
                  endCallFunc: property,
                  args: cbArgs,
                  time: new Date().getTime(),
                });

                originalCallback.call(originalInstance, ...cbArgs);
              };

              return;
            }
          });

          // proxy only async methods (that have a callback through args)
          if (null !== originalCallback) {
            // @todo - log RUM event
            S3FsProxy.logRumEvent({
              startCallFunc: property,
              args: args,
              time: new Date().getTime(),
            });
          }

          originalFunction.call(originalInstance, ...args);
        };
      } else {
        proxy[property] = originalInstance[property];
      }
    }

    return proxy;
  }

  /**
   * @todo implement it
   *
   * @param event
   */
  static logRumEvent(event) {
    console.log('RUM log - ', event);
  }
}