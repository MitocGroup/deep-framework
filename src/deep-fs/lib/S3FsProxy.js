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
    let proxy = originalInstance.constructor();

    for (var property in originalInstance) {
      if (originalInstance.hasOwnProperty(property)) {
        proxy[property] = originalInstance[property];

        if (typeof property === 'function') {
          let originalFunction = originalInstance[property];

          proxy[property] = (...args) => {
            // seeking the callback function through the arguments and proxy it
            args.forEach((arg, index) => {
              if (typeof arg === 'function') {
                let originalCallback = arg;

                args[index] = (...cbArgs) => {
                  // @todo - log RUM event
                  S3FsProxy.logRumEvent({
                    endCallFunc: property,
                    args: cbArgs,
                    time: new Date().getTime(),
                  });

                  originalCallback(...cbArgs); // @todo - check if it requires to bind originalInstance context
                };

                return;
              }
            });

            // @todo - log RUM event
            S3FsProxy.logRumEvent({
              startCallFunc: property,
              args: args,
              time: new Date().getTime(),
            });

            originalFunction(...args); // @todo - check if it requires to bind originalInstance context
          };
        }
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