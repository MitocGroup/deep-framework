/**
 * Created by AlexanderC on 6/10/15.
 */

'use strict';

import {Exception} from '../../Exception/Exception';

export class MissingCacheImplementationException extends Exception {
  constructor() {
    super('Missing cache implementation in Request object');
  }
}
