/**
 * Created by mgoria on 6/10/15.
 */

'use strict';

import {Exception} from './Exception';

/**
 * Thrown when unknown FS folder is requested
 */
export class UnknownFolderException extends Exception {
  /**
   * @param {String} folderName
   * @param {Array} folders
   */
  constructor(folderName, folders) {
    super(`Unknown folder "${folderName}". Defined folders are "${folders.join(', ')}"`);
  }
}
