/**
 * Created by AlexanderC on 6/10/15.
 */

'use strict';

import {Exception} from './Exception';

/**
 * Thrown when missing requested microservice
 */
export class MissingMicroserviceException extends Exception {
  /**
   * @param {String} microserviceIdentifier
   */
  constructor(microserviceIdentifier) {
    super(`Missing microservice ${microserviceIdentifier} in Kernel container`);
  }
}
