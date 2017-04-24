/**
 * Created by AlexanderC on 5/22/15.
 */

'use strict';

import {Framework} from './Framework';
import DeepAsset from 'deep-asset';
import DeepCache from 'deep-cache';
import DeepSecurity from 'deep-security';
import DeepResource from 'deep-resource';
import DeepLog from 'deep-log';
import DeepEvent from 'deep-event';
import DeepValidation from 'deep-validation';
import DeepSearch from 'deep-search';
import DeepDb from 'deep-db';
import DeepFs from 'deep-fs';

//import DeepNotification from 'deep-notification';

module.exports = new Framework({
  Asset: DeepAsset,
  Cache: DeepCache,
  DB: DeepDb,
  FS: DeepFs,
  Security: DeepSecurity,
  Resource: DeepResource,
  Log: DeepLog,
  Validation: DeepValidation,
  Search: DeepSearch,
  Event: DeepEvent,

  //Notification: 'deep-notification',
}, Framework.BACKEND_CONTEXT);
