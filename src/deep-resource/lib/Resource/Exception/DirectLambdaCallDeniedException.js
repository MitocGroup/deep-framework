/**
 * Created by AlexanderC on 8/21/15.
 */

'use strict';

import {Exception} from '../../Exception/Exception';

export class DirectLambdaCallDeniedException extends Exception {
  /**
   * @param {Request} request
   */
  constructor(request) {
    let endpoint = request.action.source.original;

    super(`Direct Lambda calls are disallowed on ${endpoint} because of 'action.forceUserIdentity=true'`);
  }
}
