/**
 * Created by AlexanderC on 6/10/15.
 */

'use strict';

import {Exception} from '../../Exception/Exception';

/**
 * Thrown when no working microservice set
 */
export class MissingWorkingMicroserviceException extends Exception {
  constructor() {
    super('Missing working microservice from Kernel.MicroserviceInjectable');
  }
}
