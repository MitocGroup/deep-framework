/**
 * Created by mgoria on 3/4/16.
 */

'use strict';

import elasticsearch from 'elasticsearch';

/**
 * Elasticsearch client
 * @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/index.html
 */
export class Elasticsearch {
  /**
   * @param {String} host
   */
  constructor(host) {
    this._esClient = new elasticsearch.Client({
      host: host,
    });
  }

  /**
   * @param {String} methodName
   * @param {Object} params
   * @param {Function} callback
   */
  exec(methodName, params, callback) {
    // RUM log ...

    this._esClient[methodName](params, (error, response) => {
      // RUM log ...

      callback(error, response);
    });
  }
}