/**
 * Created by CCristi <ccovali@mitocgroup.com> on 3/28/16.
 */

'use strict';

import HttpConnection from 'elasticsearch/src/lib/connectors/http';
import aws4 from 'aws4';

/**
 * Aws4 Signed Http Connection Factory
 */
export class Aws4SignedHttpConnectionFactory {
  /**
   * @param {Object} awsCredentials
   */
  constructor(awsCredentials = null) {
    this._awsCredentials = awsCredentials;
  }

  /**
   * @returns {$ES6_ANONYMOUS_CLASS$}
   */
  create() {
    let connectionFactory = this;

    /**
     * Aws4 Signed Http Connection
     */
    return class extends HttpConnection {
      /**
       * @param {Object} params
       * @returns {Object}
       */
      makeReqParams(params) {
        let body = params.body;

        params = super.makeReqParams(params);
        params.headers = params.headers || {};
        let signParams = Object.assign(params, {service: 'es'});

        if (body) {
          signParams.body = body;
        }

        let aws4Signature = connectionFactory._createAws4Signature(signParams);

        ['X-Amz-Date', 'X-Amz-Security-Token', 'Authorization'].forEach((header) => {
          params.headers[header] = aws4Signature.headers[header];
        });

        return params;
      }
    }
  }

  /**
   * @param {Object} optsToSign
   * @returns {Object}
   * @private
   */
  _createAws4Signature(optsToSign) {
    return aws4.sign(optsToSign, this._awsCredentials);
  }
}
