/**
 * Created by AlexanderC on 5/22/15.
 */

'use strict';

import {Framework} from './Framework';

module.exports = new Framework({
  Asset: 'deep-asset',
  Cache: 'deep-cache',
  DB: 'deep-db',
  FS: 'deep-fs',
  Security: 'deep-security',
  Resource: 'deep-resource',
  Log: 'deep-log',
  Validation: 'deep-validation',
  Search: 'deep-search',

  //Notification: 'deep-notification',
  //Event: 'deep-event',
}, Framework.BACKEND_CONTEXT);
