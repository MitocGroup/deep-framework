/**
 * Created by AlexanderC on 6/12/15.
 */

'use strict';

import {Exception} from '../../../Exception/Exception';

export class ContextAlreadySentException extends Exception {
  constructor() {
    super('The Lambda context have been already sent');
  }
}
