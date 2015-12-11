/**
 * Created by CCristi <ccovali@mitocgroup.com> on 12/10/15.
 */

'use strict';

/**
 * Shared Cache
 */
export class SharedCache {
  /**
   * @param {AbstractDriver} driver
   */
  constructor(driver) {
    this._driver = driver;
  }

  /**
   * @todo: use Promise when get rid of transpiler
   *
   * @param {Request} requestObject
   * @param {Function} callback
   * @returns {Promise}
   */
  request(requestObject, callback = () => {}) {
    let cacheKey = this._getRequestIdentifier(requestObject);

    this._driver.has(cacheKey, (err, has) => {
      if (err) {
        return callback(err, null);
      }

      if (has) {
        this._driver.get(cacheKey, (err, data) => {
          if (err) {
            return callback(err, null);
          }

          return resolve(data);
        });
      } else {
        requestObject.send((err, response) => {
          if (err) {
            return callback(err, null);
          }

          // do not save it. It's saved internally in lambda
          callback(null, response);
        });
      }
    });
  }

  /**
   * @param {Request} request
   * @returns {*}
   * @private
   */
  _getRequestIdentifier(request) {
    let action = request.action;
    let requestIdentifier = action.source[request.isLambda ? 'original' : 'api'];

    return `${requestIdentifier}#${request.payload}`;
  }
}
