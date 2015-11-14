'use strict';

import {ConsoleDriver} from '../../lib.compiled/Driver/ConsoleDriver';

/**
 * Console native logging
 */
export class ConsoleDriverMock extends ConsoleDriver {
  /**
   * @returns {Object}
   */
  static get nativeConsole() {
    return [];
  }
}
