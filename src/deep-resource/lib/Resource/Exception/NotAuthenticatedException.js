/**
 * Created by mgoria on 11/03/15.
 */

'use strict';

import {Exception} from '../../Exception/Exception';

export class NotAuthenticatedException extends Exception {
  constructor() {
    super(
      `Missing authentication token! You may authenticate the user first(ex. security.anonymousLogin()).`
    );
  }
}
