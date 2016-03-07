/**
 * Created by AlexanderC on 3/7/16.
 */

'use strict';

import {AbstractDriver} from './AbstractDriver';

export class HttpDriver extends AbstractDriver {
  /**
   * @param {String} endpoint
   */
  constructor(endpoint = null) {
    super();

    this._endpoint = endpoint;
  }

  /**
   * @returns {String|*}
   */
  get endpoint() {
    return this._endpoint;
  }

  /**
   * @param {String} endpoint
   * @returns {HttpDriver}
   */
  setEndpoint(endpoint) {
    this._endpoint = endpoint;

    return this;
  }

  /**
   * @param {String} endpoint
   * @private
   */
  _load(endpoint = null) {
    this._endpoint = endpoint || this._endpoint;
console.log(`Load cfg from Http ${this._endpoint}`);//@todo:remove
    let client = new XMLHttpRequest();

    client.open('GET', this._endpoint);

    client.onreadystatechange = () => {
      if (client.readyState === 4) {
        if (client.status !== 200) {
          this.fail(`Failed to load config from ${this._endpoint} (status=${client.status})`);
        } else {
          this.loadedJson(client.responseText);
        }
      }
    };

    client.send();
  }
}
