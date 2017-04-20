/**
 * Created by CCristi <ccovali@mitocgroup.com> on 3/28/16.
 */

'use strict';

import HttpConnection from 'elasticsearch/src/lib/connectors/http';
import aws4 from 'aws4';
import util from 'util';

/**
 * Aws4 Signed Http Connection Factory
 */
export class Aws4SignedHttpConnection extends HttpConnection {
  /**
   * @param {{accessKeyId: String, secretAccessKey: String}|null} awsCredentials
   * @param {Object[]} args
   */
  constructor(awsCredentials, ...args) {
    super(...args);

    this._awsCredentials = awsCredentials;
  }

  /**
   * @param {Object} params
   * @returns {*}
   */
  makeReqParams(params) {
    let body = params.body;

    params = super.makeReqParams(params);
    params.headers = params.headers || {};

    let signParams = {
      service: 'es',
      region: Aws4SignedHttpConnection.getEsDomainRegion(params.hostname),
      host: params.hostname,
      method: params.method,
      path: params.path,
      headers: util._extend(params.headers, {}),
    };

    if (body) {
      signParams.body = body;
    }

    let aws4Signature = this._createAws4Signature(signParams);

    ['X-Amz-Date', 'X-Amz-Security-Token', 'Authorization'].forEach((header) => {
      params.headers[header] = aws4Signature.headers[header];
    });

    return params;
  }

  /**
   * @param {Object} optsToSign
   * @returns {Object}
   * @private
   */
  _createAws4Signature(optsToSign) {
    return aws4.sign(optsToSign, this._awsCredentials);
  }

  /**
   * @param {String} esDomainHostname
   * @returns {String}
   */
  static getEsDomainRegion(esDomainHostname) {
    let regionParts = esDomainHostname.match(/\.([^\.]+)\.es\.amazonaws\.com$/i);

    if (regionParts && regionParts.length >= 2) {
      return regionParts[1];
    }

    throw new Error(`Invalid ES domain hostname "${esDomainHostname}".`);
  }

  /**
   * @param {{accessKeyId: String, secretAccessKey: String}|null} awsCredentials
   * @returns {Aws4SignedHttpConnection.prototype}
   */
  static createPrototype(awsCredentials = null) {
    return Aws4SignedHttpConnection.bind(null, awsCredentials);
  }
}
