/**
 * Created by AlexanderC on 1/21/16.
 */

'use strict';

import domain from 'domain';

export class Sandbox {
  /**
   * @param {Function} func
   */
  constructor(func) {
    this._func = func;
    this._onFail = Sandbox.ON_FAIL_CB;
  }

  /**
   * @returns {Function}
   */
  get func() {
    return this._func;
  }

  /**
   * @returns {Sandbox}
   */
  run(...args) {
    let failed = false;
    let execDomain = domain.create();

    let failCb = (error) => {
      if (failed) {
        return;
      }

      failed = true;

      execDomain.exit();

      process.nextTick(() => {
        this._onFail(error);
      });
    };

    execDomain.on('error', failCb);

    try {
      execDomain.run(this._func, ...args);
    } catch (error) {
      failCb(error);
    }

    return this;
  }

  /**
   * @param {Function} cb
   * @returns {Sandbox}
   */
  fail(cb) {
    this._onFail = cb;

    return this;
  }

  /**
   * @returns {Function}
   */
  static get ON_FAIL_CB() {
    return (error) => {
      console.error(error);
    };
  }
}
