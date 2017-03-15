/**
 * Created by AlexanderC on Fri Jul 01 2016.
 */

/*eslint no-loop-func: 0, no-bitwise: 0, eqeqeq: 0 */

'use strict';

export class UUID {
  /**
   * Generates an RFC4122 v4 compliant UUID
   *
   * If ensureUnique=true it ensures
   * an unique UUID across the current runtime
   *
   * IMPORTANT! This solution is not crypto-secure!
   *
   * @param {Boolean} ensureUnique = true
   * @returns {String}
   */
  static generate(ensureUnique = true) {
    this._uuids = this._uuids || [];

    let date = new Date().getTime();

    if (window &&
      window.performance &&
      typeof window.performance.now === 'function') {

      date += performance.now();
    }

    let uuid = null;

    do {
      uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, char => {
        date = Math.floor(date / 16);
        let rand = (date + Math.random() * 16) % 16 | 0;

        return (char == 'x' ? rand : (rand & 0x3 | 0x8)).toString(16);
      });
    } while (!ensureUnique || this._uuids.indexOf(uuid) !== -1);

    if (this._uuids.indexOf(uuid) === -1) {
      this._uuids.push(uuid);
    }

    return uuid;
  }
}
