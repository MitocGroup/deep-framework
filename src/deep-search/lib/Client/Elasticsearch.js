/**
 * Created by mgoria on 3/4/16.
 */

'use strict';

import Core from 'deep-core';
import elasticsearch from 'elasticsearch';
import {Aws4SignedHttpConnectionFactory} from './Connection/Aws4SignedHttpConnectionFactory';

/**
 * Elasticsearch client
 * @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/index.html
 */
export class Elasticsearch {
  /**
   * @param {String} host
   * @param {Function|null} decorator
   */
  constructor(host, decorator = null) {
    this._host = host;
    this._decorator = decorator;

    this._esClient = new elasticsearch.Client({
      host: this._host,
      apiVersion: '2.1', // @note - If you want to change this version do update deep-search/node-bin/cleanup.sh also
      connectionClass: new Aws4SignedHttpConnectionFactory().create()
    });

    this._proxy(this, this._esClient, this._decorator);
  }

  /**
   * @param {Elasticsearch} target
   * @param {elasticsearch} handler
   * @param {Function} decorator
   * @param {Array} methods
   *
   * @returns {Object}
   * @private
   */
  _proxy(target, handler, decorator, methods = []) {
    return new Core.Generic.MethodsProxy(target)
      .decorate(decorator)
      .proxyOverride(handler, methods);
  }
}