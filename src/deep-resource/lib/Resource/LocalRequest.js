/**
 * Created by AlexanderC on 6/10/15.
 */

'use strict';

import {SuperagentResponse} from './SuperagentResponse';
import {LambdaResponse} from './LambdaResponse';
import {Request} from './Request';
import {Action} from './Action';
import Http from 'superagent';
import {MissingLocalLambdaExecWrapperException} from './Exception/MissingLocalLambdaExecWrapperException';
import {MissingLambdaLocalPathException} from './Exception/MissingLambdaLocalPathException';
import urlParse from 'url-parse';

/**
 * Resource request instance
 */
export class LocalRequest extends Request {
  constructor(...args) {
    super(...args);
  }

  /**
   * @returns {String}
   * @private
   */
  _buildEndpointUrl() {
    let endpoint = this._async ? LocalRequest.LOCAL_LAMBDA_ASYNC_ENDPOINT :  LocalRequest.LOCAL_LAMBDA_ENDPOINT;

    if (this.baseUrl) {
      let urlParts = urlParse(this.baseUrl);
      let protocol = urlParts.protocol || 'http:';
      let baseUrl = `${protocol}//${urlParts.host}`;

      endpoint = baseUrl + endpoint;
    }

    return endpoint;
  }

  /**
   * @param {Function} callback
   * @returns {LocalRequest|*}
   */
  _send(callback = () => {}) {
    let actionType = this._action.type;
    let securityService = this._action.resource.security;

    if (actionType === Action.LAMBDA) {
      let data = {
        lambda: this._action.source.original,
        payload: this.payload,
        method: this._method,
        context: {
          identity: {
            cognitoIdentityPoolId: securityService.token ? securityService.token.identityPoolId : null,
            cognitoIdentityId: securityService.token ? securityService.token.identityId : null,
            isAnonymous: securityService.token ? securityService.token.isAnonymous : true,
          },
        },
      };

      if (typeof window === 'undefined') {
        if (!global.hasOwnProperty(LocalRequest.LAMBDA_EXEC_WRAPPER_KEY)) {
          throw new MissingLocalLambdaExecWrapperException(LocalRequest.LAMBDA_EXEC_WRAPPER_KEY);
        }

        let localPath = this._action.source._localPath;

        if (!localPath) {
          throw new MissingLambdaLocalPathException(data.lambda);
        }

        let execWrapper = global[LocalRequest.LAMBDA_EXEC_WRAPPER_KEY];

        execWrapper[this._async ? 'invokeAsync' : 'invoke'](localPath, data, (error, result) => {
          let resultData = {};

          if (this._async) {
            resultData.Status = 202;
          } else {
            resultData.Payload = result;
          }

          callback(new LambdaResponse(this, error ? null : resultData, error));
        });
      } else {
        Http.post(this._buildEndpointUrl())
          .send(data)
          .end((error, response) => {
            callback(new SuperagentResponse(this, response, error));
          });
      }
    } else {
      return this.constructor.useNative()._send(...arguments);
    }

    return this;
  }

  /**
   * @returns {String}
   */
  static get LOCAL_LAMBDA_ENDPOINT() {
    return '/_/lambda';
  }

  /**
   * @returns {String}
   */
  static get LOCAL_LAMBDA_ASYNC_ENDPOINT() {
    return '/_/lambda-async';
  }

  /**
   * @returns {String}
   */
  static get LAMBDA_EXEC_WRAPPER_KEY() {
    return '_deep_lambda_exec_';
  }
}
