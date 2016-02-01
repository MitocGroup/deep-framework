/**
 * Created by AlexanderC on 6/10/15.
 */

'use strict';

import {Response} from './Response';
import {LambdaResponse} from './LambdaResponse';

export class SuperagentResponse extends Response {
  /**
   * @param {*} args
   */
  constructor(...args) {
    super(...args);

    if (this._request.isLambda) {
      this._parseLambda();
    } else {
      this._parseExternal();
    }
  }

  /**
   * @private
   */
  _parseLambda() {
    this._parseExternal();

    // check if any Lambda response available
    if (this._data && !this._error) {

      // manage this weird case...
      if (typeof this._data === 'string') {
        try {
          this._data = JSON.parse(this._data);
        } catch (e) {
        }
      }

      let dataObj = this._data;

      // check whether Lambda execution failed
      if (dataObj.errorMessage) {
        let errorObj = dataObj.errorMessage;

        if (typeof errorObj === 'string') {
          try {
            errorObj = JSON.parse(errorObj);
          } catch(e) {}
        } else {
          errorObj = errorObj || {
              errorMessage: 'Unknown error occurred.',
              errorStack: (new Error('Unknown error occurred.')).stack,
              errorType: 'UnknownError',
            };
        }

        this._error = LambdaResponse.getPayloadError(errorObj);
      } else {
        this._data = dataObj;
      }
    }
  }

  /**
   * @private
   */
  _parseExternal() {
    let data = this._rawData;
    let error = this._rawError;

    if (error) {
      this._error = error;
    } else if (data && data.error) { // weird case...
      this._error = data.error;
    } else {
      this._data = data && data.body ? data.body : null;
    }

    // @todo: treat Response.status lack somehow else?
    if (data && data.status) {
      this._statusCode = parseInt(data.status);
    } else if (this._data && !this._error) {
      this._statusCode = 200;
    } else {
      this._statusCode = 500;
    }
  }
}
