/**
 * Created by AlexanderC on 6/10/15.
 */

'use strict';

import {Exception} from './Exception';

/**
 * Thrown when requested resource not found
 */
export class MissingResourceException extends Exception {
  /**
   * @param {String} microserviceIdentifier
   * @param {String} resourceIdentifier
   */
  constructor(microserviceIdentifier, resourceIdentifier) {
    super(`Missing resource ${resourceIdentifier} in ${microserviceIdentifier}`);
  }
}
