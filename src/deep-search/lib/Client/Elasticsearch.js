/**
 * Created by mgoria on 3/4/16.
 */

'use strict';

import Core from 'deep-core';
import elasticsearch from 'elasticsearch';
import {Aws4SignedHttpConnection} from './Connection/Aws4SignedHttpConnection';

/**
 * Elasticsearch client
 * @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/index.html
 */
export class Elasticsearch {

  /**
   * @param {String} host
   * @param {Function|null} decorator
   * @param {Boolean} useAws4Signature
   */
  constructor(host, decorator = null, useAws4Signature = true) {
    this._host = host;
    this._decorator = decorator;

    let clientOpts = {};
    clientOpts.host = this._host;
    clientOpts.apiVersion = Elasticsearch.API_VERSION;

    if (useAws4Signature) {
      clientOpts.connectionClass = Aws4SignedHttpConnection.createPrototype();
    }

    this._esClient = new elasticsearch.Client(clientOpts);

    this._proxy(this, this._esClient, this._decorator);
  }

  /**
   * @param {Elasticsearch} target
   * @param {elasticsearch} handler
   * @param {Function} decorator
   * @param {Array} methods
   * @private
   */
  _proxy(target, handler, decorator, methods = Elasticsearch.API_METHODS) {
    let proxy = new Core.Generic.MethodsProxy(target).decorate(decorator);
    proxy.proxyOverride(handler, ...methods);
    proxy.proxyProperties(handler);
  }

  /**
   * @returns {Object[]}
   */
  static get API_METHODS() {
    let esApis = require('elasticsearch/src/lib/apis');

    return Object.keys(esApis[Elasticsearch.API_VERSION]);
  }

  /**
   * @returns {String}
   * @note - If you want to change this version do update deep-search/node-bin/cleanup.sh also
   */
  static get API_VERSION() {
    return '2.1';
  }
}
