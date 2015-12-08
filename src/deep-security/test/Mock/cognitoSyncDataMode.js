/**
 * Created by vcernomschi on 11/23/15.
 */

'use strict';

import {CognitoSyncMock} from './CognitoSyncMock';

export default {
  CognitoSync: () => {
    return new CognitoSyncMock(CognitoSyncMock.DATA_MODE);
  }
};
