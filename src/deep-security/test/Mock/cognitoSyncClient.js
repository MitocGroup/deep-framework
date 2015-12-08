/**
 * Created by vcernomschi on 11/23/15.
 */

'use strict';

import {CognitoSyncClientMock} from './CognitoSyncClientMock';

export default {
  CognitoSyncManager: () => {
    return new CognitoSyncClientMock();
  }
};
