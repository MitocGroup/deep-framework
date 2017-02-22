/**
 * Created by AlexanderC on 5/22/15.
 */

/*eslint no-unused-vars: 0*/

'use strict';

import {Framework} from './Framework';
import DeepAsset from 'deep-asset';
import DeepCache from 'deep-cache';
import DeepSecurity from 'deep-security';
import DeepResource from 'deep-resource';
import DeepLog from 'deep-log';
import DeepEvent from 'deep-event';
import DeepValidation from 'deep-validation';

// @todo - fix lodash error "Uncaught TypeError: Cannot read property 'prototype' of undefined" in runInContext method
//import DeepSearch  from 'deep-search';

//import DeepNotification from 'deep-notification';

let exports = module.exports = new Framework({
  Asset: DeepAsset,
  Cache: DeepCache,
  Security: DeepSecurity,
  Resource: DeepResource,
  Log: DeepLog,
  Validation: DeepValidation,
  Event: DeepEvent,

  //Search: DeepSearch,
  //Notification: DeepNotification,
}, Framework.FRONTEND_CONTEXT);
