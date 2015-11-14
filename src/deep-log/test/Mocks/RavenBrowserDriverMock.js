
'use strict';

import {RavenBrowserDriver} from '../../lib.compiled/Driver/RavenBrowserDriver';

/**
 * Raven/Sentry mock logging for browser
 */
export class RavenBrowserDriverMock extends RavenBrowserDriver {

  /**
   * @param {String} dsn
   * @private
   */
  static _prepareDsn(dsn) {
    return;
  }
}
