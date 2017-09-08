/**
 * Created by CCristi on 4/4/17.
 */

'use strict';

import AWS from 'aws-sdk';
import {AbstractImplementation} from './AbstractImplementation';

export class UserPoolImplementation extends AbstractImplementation {
  /**
   * @param {Object[]|*} args
   */
  constructor(...args) {
    super(...args);
  }

  /**
   * @returns {Promise}
   */
  refreshIdentity() {
    let payload = {
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      ClientId: this.clientName,
      AuthParameters: {
        REFRESH_TOKEN: this.refreshToken,
      }
    };

    return this.cognitoIdentityServiceProvider.makeUnauthenticatedRequest('initiateAuth', payload)
      .promise()
      .then(response => {
        let authResult = response.AuthenticationResult;

        this.identityProvider.tokenExpirationTime = Date.now() + authResult.ExpiresIn * 1000;
        this.identityProvider.userToken = authResult.IdToken;
      });
  }

  /**
   * @returns {AWS.CognitoIdentityServiceProvider}
   */
  get cognitoIdentityServiceProvider() {
    if (AWS.hasOwnProperty('CognitoIdentityServiceProvider')) {
      // token refresh doesn't need any AWS credentials passed to service config
      return new AWS.CognitoIdentityServiceProvider();
    }

    throw new Error(`Missing CognitoIdentityServiceProvider in aws-sdk@${AWS.VERSION}`);
  }
}
