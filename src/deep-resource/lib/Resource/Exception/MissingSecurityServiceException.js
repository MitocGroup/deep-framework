/**
 * Created by mgoria on 11/03/15.
 */

'use strict';

import {Exception} from '../../Exception/Exception';

export class MissingSecurityServiceException extends Exception {
  constructor() {
    super('Missing security service in Request instance.');
  }
}
