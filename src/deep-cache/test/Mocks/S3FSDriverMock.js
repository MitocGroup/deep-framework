'use strict';

import {S3FSDriver} from '../../lib/Driver/S3FSDriver';
import FSMock from './FSMock';

export class S3FSDriverMock extends S3FSDriver {

  /**
   * Returns mock of s3fs
   * @returns {s3fs}
   * @private
   */
  get _fs() {
    return FSMock();
  }
}
