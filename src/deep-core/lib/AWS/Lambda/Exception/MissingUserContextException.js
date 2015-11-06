/**
 * Created by mgoria on 10/31/15.
 */

'use strict';

import {Exception} from '../../../Exception/Exception';

export class MissingUserContextException extends Exception {
  constructor() {
    super('Missing user context in the Lambda runtime');
  }
}
