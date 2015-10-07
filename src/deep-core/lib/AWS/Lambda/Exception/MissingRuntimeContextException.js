/**
 * Created by AlexanderC on 6/12/15.
 */

'use strict';

import {Exception} from '../../../Exception/Exception';

/**
 * Thrown when missing runtime lambda context
 */
export class MissingRuntimeContextException extends Exception {
  constructor() {
    super('Missing Lambda runtime context');
  }
}
