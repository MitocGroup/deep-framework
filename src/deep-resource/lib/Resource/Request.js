/**
 * Created by AlexanderC on 6/10/15.
 */

'use strict';

import {SuperagentResponse} from './SuperagentResponse';
import {LambdaResponse} from './LambdaResponse';
import {Response} from './Response';
import {Exception} from '../Exception/Exception';
import {Action} from './Action';
import Http from 'superagent';
import AWS from 'aws-sdk';
import {MissingCacheImplementationException} from './Exception/MissingCacheImplementationException';
import {CachedRequestException} from './Exception/CachedRequestException';
import aws4 from 'aws4';
import parseUrl from 'parse-url';
import queryString from 'query-string';
import Core from 'deep-core';
import {DirectLambdaCallDeniedException} from './Exception/DirectLambdaCallDeniedException';
import {MissingSecurityServiceException} from './Exception/MissingSecurityServiceException';
import Security from 'deep-security';

/**
 * Action request instance
 */
export class Request {
  /**
   * @param {Action} action
   * @param {Object} payload
   * @param {String} method
   */
  constructor(action, payload, method) {
    this._action = action;
    this._payload = payload;
    this._method = method;
    this._lambda = null;

    this._cacheImpl = null;
    this._cacheTtl = Request.TTL_FOREVER;
    this._cached = false;

    this._native = false;
  }

  /**
   * @returns {Boolean}
   */
  get native() {
    return this._native;
  }

  /**
   * @returns {Request}
   */
  useDirectCall() {
    if (this._action.forceUserIdentity) {
      throw new DirectLambdaCallDeniedException(this);
    }

    this._native = true;
    return this;
  }

  /**
   * @returns {Boolean}
   */
  get isCached() {
    return this._cacheImpl && this._cached;
  }

  /**
   * @returns {Request}
   */
  enableCache() {
    this._cached = true;
    return this;
  }

  /**
   * @returns {Request}
   */
  disableCache() {
    this._cached = false;
    return this;
  }

  /**
   * @param {Number} ttl
   * @returns {Request}
   */
  cache(ttl = Request.TTL_FOREVER) {
    if (!this._cacheImpl) {
      throw new MissingCacheImplementationException();
    }

    this._cacheTtl = ttl;
    this.enableCache();

    return this;
  }

  /**
   * @returns {Number}
   */
  get cacheTtl() {
    return this._cacheTtl;
  }

  /**
   * @param {Number} ttl
   */
  set cacheTtl(ttl) {
    this._cacheTtl = ttl;
  }

  /**
   * @returns {Object}
   */
  get cacheImpl() {
    return this._cacheImpl;
  }

  /**
   * @param {Object} cache
   */
  set cacheImpl(cache) {
    this._cacheImpl = cache;

    // @todo: do we really have to force it?
    this.cache(Request.TTL_DEFAULT);
  }

  /**
   * @returns {String}
   * @private
   */
  _buildCacheKey() {
    let payload = JSON.stringify(this._payload);
    let endpoint = this.native ? this._action.source.original : this._action.source.api;

    return `${this._method}:${this._action.type}:${endpoint}#${payload}`;
  }

  /**
   * @param {Response} response
   * @returns {String}
   * @private
   */
  static _stringifyResponse(response) {
    return JSON.stringify({
      _class: response.constructor.name,
      data: response.rawData,
      error: response.rawError,
    });
  }

  /**
   * @param {String} rawData
   * @returns {Response}
   * @private
   */
  _rebuildResponse(rawData) {
    let response = JSON.parse(rawData);

    if (!response) {
      throw new CachedRequestException(`Unable to unpack cached JSON object from ${rawData}`);
    }

    let ResponseImpl = Request._chooseResponseImpl(response._class);

    if (!ResponseImpl) {
      throw new Exception(`Unknown Response implementation ${response._class}`);
    }

    return new ResponseImpl(this, response.data, response.error);
  }

  /**
   * @param {String} className
   * @returns {*}
   * @private
   */
  static _chooseResponseImpl(className) {
    let implMap = {};

    implMap[Response.name] = Response;
    implMap[LambdaResponse.name] = LambdaResponse;
    implMap[SuperagentResponse.name] = SuperagentResponse;

    return implMap[className];
  }

  /**
   * @param {Function} callback
   */
  invalidateCache(callback = () => {}) {
    if (!this.isCached) {
      callback(true);

      return this;
    }

    let cache = this._cacheImpl;
    let cacheKey = this._buildCacheKey();

    cache.has(cacheKey, (error, result) => {
      if (error) {
        throw new CachedRequestException(error);
      }

      if (result) {
        cache.invalidate(cacheKey, 0, (error, result) => {
          if (error) {
            throw new CachedRequestException(error);
          }

          callback(result);
        });

        return;
      }

      callback(true);
    });

    return this;
  }

  /**
   * @param {Function} callback
   */
  send(callback = () => {}) {
    if (!this.isCached) {
      return this._send(callback);
    }

    let cache = this._cacheImpl;
    let invalidateCache = this._cacheTtl === Request.TTL_INVALIDATE;
    let cacheKey = this._buildCacheKey();

    cache.has(cacheKey, (error, result) => {
      if (error) {
        throw new CachedRequestException(error);
      }

      if (result && !invalidateCache) {
        cache.get(cacheKey, (error, result) => {
          if (error) {
            throw new CachedRequestException(error);
          }

          callback(this._rebuildResponse(result));
        });

        return;
      }

      this._send((response) => {
        cache.set(cacheKey, Request._stringifyResponse(response), this._cacheTtl, (error, result) => {
          if (!result) {
            error = `Unable to persist request cache under key ${cacheKey}`;
          }

          if (error) {
            throw new CachedRequestException(error);
          }
        });

        // @todo: do it synchronous?
        callback(response);
      });
    });

    return this;
  }

  /**
   * @returns {Boolean}
   *
   * @todo: remove this?
   */
  get isLambda() {
    return this._action.type === Action.LAMBDA;
  }

  /**
   * @param {Function} callback
   * @returns {Request}
   */
  _send(callback = () => {}) {
    if (!this._native) {
      return this._sendThroughApi(callback);
    }

    switch (this._action.type) {
      case Action.LAMBDA:
        this._sendLambda(callback);
        break;
      case Action.EXTERNAL:
        this._sendExternal(callback);
        break;
      default: throw new Exception(`Request of type ${this._action.type} is not implemented`);
    }

    return this;
  }

  /**
   * @param {Function} callback
   * @returns {Request}
   * @private
   */
  _sendThroughApi(callback = () => {}) {

    let endpoint = this._action.source.api;
    let signedRequest = this._createAws4SignedRequest(
      endpoint,
      this.method,
      this.payload
    );

    signedRequest.end((error, response) => {
      callback(new SuperagentResponse(this, response, error));
    });

    return this;
  }

  /**
   * @param {Function} callback
   * @returns {Request}
   * @private
   */
  _sendLambda(callback = () => {}) {
    // @todo: set retries in a smarter way...
    AWS.config.maxRetries = 3;

    this._lambda = new AWS.Lambda({
      region: this._action.region,
    });

    let invocationParameters = {
      FunctionName: this._action.source.original,
      Payload: JSON.stringify(this.payload),
    };


    this._lambda.invoke(invocationParameters, (error, data) => {
      callback(new LambdaResponse(this, data, error));
    });

    return this;
  }

  /**
   * @param {Function} callback
   * @returns {Request}
   * @private
   */
  _sendExternal(callback = () => {}) {
    Http[this._method.toLowerCase()](this._action.source.original)
      .send(this.payload)
      .end((error, response) => {
        callback(new SuperagentResponse(this, response, error));
      });

    return this;
  }

  /**
   * @param {String} url
   * @param {String} httpMethod
   * @param {Object} payload
   * @private
   */
  _createAws4SignedRequest(url, httpMethod, payload) {
    let urlParts = parseUrl(url);
    let apiHost = urlParts.resource;
    let apiPath = urlParts.pathname ? urlParts.pathname : '/';
    let apiQueryString = urlParts.search ? `?${urlParts.search}` : '';

    let opsToSign = {
      service: Core.AWS.Service.API_GATEWAY_EXECUTE,
      region: this.getEndpointHostRegion(apiHost),
      host: apiHost,
      method: httpMethod,
      path: `${apiPath}${apiQueryString}`,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    httpMethod = httpMethod.toLowerCase();

    switch (httpMethod) {
      case 'get':
      case 'delete':
        opsToSign.path += (apiQueryString ? '&' : '?') + queryString.stringify(payload);
        break;
      case 'post':
      case 'put':
      case 'patch':
        opsToSign.body = JSON.stringify(payload);
        break;
    }

    let signature = aws4.sign(opsToSign, this._getSecurityCredentials());

    return Http[httpMethod](url, payload)
      .set('Content-Type', 'application/json')
      .set('X-Amz-Date', signature.headers['X-Amz-Date'])
      .set('X-Amz-Security-Token', signature.headers['X-Amz-Security-Token'])
      .set('Authorization', signature.headers.Authorization);
  }

  /**
   * @returns {Object}
   * @private
   */
  _getSecurityCredentials() {
    if (!(this._action.resource.security instanceof Security)) {
      throw new MissingSecurityServiceException();
    }

    return this._action.resource.security.token.credentials;
  }

  /**
   * @param {String} endpointHost
   * @returns {String}
   */
  getEndpointHostRegion(endpointHost) {
    let regionParts = endpointHost.match(/\.([^\.]+)\.amazonaws\.com$/i);

    // @todo - expose API region into config provision section
    return regionParts ? regionParts[1] : this._action.region; // use action region as fallback
  }

  /**
   * @returns {Action}
   */
  get action() {
    return this._action;
  }

  /**
   * @returns {Object}
   */
  get payload() {
    return this._payload;
  }

  /**
   * @returns {String}
   */
  get method() {
    return this._method;
  }

  /**
   * @returns {Number}
   * @constructor
   */
  static get TTL_DEFAULT() {
    return 10;
  }

  /**
   * @returns {Number}
   */
  static get TTL_INVALIDATE() {
    return -1;
  }

  /**
   * @returns {Number}
   */
  static get TTL_FOREVER() {
    return 0;
  }
}
