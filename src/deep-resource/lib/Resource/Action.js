/**
 * Created by mgoria on 8/4/15.
 */

'use strict';

import {UnknownMethodException} from './Exception/UnknownMethodException';
import {Request} from './Request';
import {LocalRequest} from './LocalRequest';

/**
 * Resource action
 */
export class Action {
  /**
   * @param {Instance} resource
   * @param {String} name
   * @param {String} type
   * @param {Array} methods
   * @param {Object} source
   * @param {String} region
   * @param {Boolean} forceUserIdentity
   * @param {Object} apiCache
   * @param {String} scope
   */
  constructor(resource, name, type, methods, source, region, forceUserIdentity, apiCache, scope) {
    this._resource = resource;
    this._name = name;
    this._type = type;
    this._methods = methods;
    this._source = source;
    this._region = region;
    this._forceUserIdentity = forceUserIdentity;
    this._apiCacheEnabled = apiCache && apiCache.hasOwnProperty('enabled') ? apiCache.enabled : false;
    this._apiCacheTtl = apiCache && apiCache.hasOwnProperty('ttl') ? apiCache.ttl : Request.TTL_INVALIDATE;
    this._scope = scope;

    this._validationSchemaName = null;
  }

  /**
   * @returns {String}
   */
  get validationSchemaName() {
    return this._validationSchemaName;
  }

  /**
   * @param {String} validationSchemaName
   */
  set validationSchemaName(validationSchemaName) {
    this._validationSchemaName = validationSchemaName;
  }

  /**
   * @param {Object} payload
   * @param {String} method
   * @returns {LocalRequest|Request}
   */
  request(payload = {}, method = null) {
    method = method || (this._methods.length > 0 ? this._methods[0] : Action.HTTP_VERBS[0]);

    if (this._methods.length > 0 && this._methods.indexOf(method) === -1) {
      throw new UnknownMethodException(method, this._methods);
    }

    let RequestImplementation = this._resource.localBackend ? LocalRequest : Request;
    let requestObject = new RequestImplementation(this, payload, method);

    requestObject.validationSchemaName = this._validationSchemaName;

    if (this._resource.cache) {
      requestObject.cacheImpl = this._resource.cache;
    }

    return requestObject;
  }

  /**
   * @returns {String}
   */
  get sourceId() {
    return this._type === Action.LAMBDA ?
      this._source.original :
      this._source.api;
  }

  /**
   * @returns {Boolean}
   */
  get forceUserIdentity() {
    return this._forceUserIdentity;
  }

  /**
   * @returns {Instance}
   */
  get resource() {
    return this._resource;
  }

  /**
   * @returns {String}
   */
  get name() {
    return this._name;
  }

  /**
   * @returns {String}
   */
  get type() {
    return this._type;
  }

  /**
   * @returns {Array}
   */
  get methods() {
    return this._methods;
  }

  /**
   * @returns {String}
   */
  get source() {
    return this._source;
  }

  /**
   * @returns {Boolean}
   */
  get isOriginalSourceInvokable() {
    return !!this._source.original;
  }

  /**
   * @returns {Boolean}
   */
  get isApiSourceInvokable() {
    return !!this._source.api;
  }

  /**
   * @returns {String}
   */
  get region() {
    return this._region;
  }

  /**
   * @returns {Boolean}
   */
  get apiCacheEnabled() {
    return this._apiCacheEnabled;
  }

  /**
   * @returns {Number}
   */
  get apiCacheTtl() {
    return this._apiCacheTtl;
  }

  /**
   * @returns {String}
   */
  get scope() {
    return this._scope;
  }

  /**
   * @returns {String}
   */
  get fullName() {
    return `@${this._resource.microservice.identifier}:${this._resource.name}:${this._name}`;
  }

  /**
   * @returns {Array}
   */
  static get HTTP_VERBS() {
    return ['GET', 'POST', 'DELETE', 'HEAD', 'PUT', 'OPTIONS', 'PATCH'];
  }

  /**
   * @returns {String}
   */
  static get LAMBDA() {
    return 'lambda';
  }

  /**
   * @returns {String}
   */
  static get EXTERNAL() {
    return 'external';
  }

  /**
   * @returns {string}
   */
  static get DEEP_CACHE_QS_PARAM() {
    return '_deepQsHash';
  }
}
