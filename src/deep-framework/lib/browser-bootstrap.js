/**
 * Created by AlexanderC on 5/22/15.
 */

'use strict';

import {Framework} from './Framework';

let exports = module.exports = new Framework({
  Asset: 'deep-asset',
  Cache: 'deep-cache',
  Security: 'deep-security',
  Resource: 'deep-resource',
  Log: 'deep-log',
  Validation: 'deep-validation',

  //Notification: 'deep-notification',
}, Kernel.FRONTEND_CONTEXT);
