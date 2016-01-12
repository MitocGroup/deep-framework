/**
 * Created by AlexanderC on 1/12/16.
 */

'use strict';

import {Exception} from '../../Exception/Exception';

export class MissingSuggesterException extends Exception {
  /**
   * @param {String} suggester
   */
  constructor(suggester) {
    super(`Missing CloudFront suggester ${suggester}`);
  }
}