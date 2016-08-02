/**
 * Created by mgoria on 2/25/16.
 */

'use strict';

/**
 * Base exception
 */
export class Helper {
  /**
   * @returns {Number[]}
   */
  static get CODES() {
    return [200, 400, 401, 403, 404, 406, 409, 500];
  }

  /**
   * @param {String|Number}code
   * @returns {Number}
   */
  static assureDefinedCode(code) {
    code = parseInt(code);

    if (Helper.CODES.indexOf(code) !== -1) {
      return code;
    }

    // fallback to a defined error code
    code = parseInt(String(code).charAt(0) + '00');

    return Helper.CODES.indexOf(code) !== -1 ? code : 500;
  }
}
