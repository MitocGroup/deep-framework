/**
 * Created by vcernomschi on 12/07/15.
 */

'use strict';

import {CognitoIdentityCredentialsMock} from './CognitoIdentityCredentialsMock';

export default {
  CognitoIdentityCredentials: () => {
    return new CognitoIdentityCredentialsMock(CognitoIdentityCredentialsMock.FAILURE_MODE);
  }
};
