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
import DeepValidation from 'deep-validation';

//import DeepNotification from 'deep-notification';

let exports = module.exports = new Framework({
  Asset: DeepAsset,
  Cache: DeepCache,
  Security: DeepSecurity,
  Resource: DeepResource,
  Log: DeepLog,
  Validation: DeepValidation,

  //Notification: DeepNotification,
}, Framework.FRONTEND_CONTEXT);
