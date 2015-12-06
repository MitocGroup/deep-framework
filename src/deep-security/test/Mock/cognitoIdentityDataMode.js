/**
 * Created by vcernomschi on 11/23/15.
 */

'use strict';

import {CognitoIdentityMock} from './CognitoIdentityMock';

export default {
  CognitoIdentity: () => {
    return new CognitoIdentityMock(CognitoIdentityMock.DATA_MODE);
  }
};
