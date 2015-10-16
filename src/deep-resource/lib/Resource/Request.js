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

    this._native = true; // @todo: change to false on an stable API Gateway version
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

    return `${this._method}:${this._action.type}:${this._action.source.original}#${payload}`;
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
  invalidateCache(callback = null) {
    if (!this.isCached) {
      callback && callback(true);

      return this;
    }

    let cache = this._cacheImpl;
    let cacheKey = this._buildCacheKey();

    cache.has(cacheKey, function(error, result) {
      if (error) {
        throw new CachedRequestException(error);
      }

      if (result) {
        cache.invalidate(cacheKey, 0, function(error, result) {
          if (error) {
            throw new CachedRequestException(error);
          }

          callback && callback(result);
        }.bind(this));

        return;
      }

      callback && callback(true);
    }.bind(this));

    return this;
  }

  /**
   * @param {Function} callback
   */
  send(callback = null) {
    if (!this.isCached) {
      return this._send(callback);
    }

    let cache = this._cacheImpl;
    let invalidateCache = this._cacheTtl === Request.TTL_INVALIDATE;
    let cacheKey = this._buildCacheKey();

    cache.has(cacheKey, function(error, result) {
      if (error) {
        throw new CachedRequestException(error);
      }

      if (result && !invalidateCache) {
        cache.get(cacheKey, function(error, result) {
          if (error) {
            throw new CachedRequestException(error);
          }

          callback && callback(this._rebuildResponse(result));
        }.bind(this));

        return;
      }

      this._send(function(response) {
        cache.set(cacheKey, Request._stringifyResponse(response), this._cacheTtl, function(error, result) {
          if (!result) {
            error = `Unable to persist request cache under key ${cacheKey}`;
          }

          if (error) {
            throw new CachedRequestException(error);
          }
        }.bind(this));

        // @todo: do it synchronous?
        callback && callback(response);
      }.bind(this));
    }.bind(this));

    return this;
  }

  /**
   * @param {Function} callback
   * @returns {Request}
   */
  _send(callback = () => null) {
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
  _sendThroughApi(callback = () => null) {
    let urlParts = parseUrl(this._action.source.api);

    let apiHost = urlParts.resource;
    let apiPath = urlParts.pathname ? urlParts.pathname : '/';
    let apiQueryString = urlParts.search ? `?${urlParts.search}` : '';

    let signature = aws4.sign({
      host: apiHost,
      path: `${apiPath}${apiQueryString}`,
    }, this._action.resource.securityCredentials);

    Http[this._method.toLowerCase()](this._action.source.api)
      .set('Host', signature.headers.Host)
      .set('X-Amz-Date', signature.headers['X-Amz-Date'])
      .set('Authorization', signature.headers.Authorization)
      .send(this.payload)
      .end(function(error, response) {
        callback(new SuperagentResponse(this, response, error));
      }.bind(this));

    return this;
  }

  /**
   * @param {Function} callback
   * @returns {Request}
   * @private
   */
  _sendLambda(callback = () => null) {
    // @todo: set retries in a smarter way...
    AWS.config.maxRetries = 3;

    this._lambda = new AWS.Lambda({
      region: this._action.region,
    });

    let invocationParameters = {
      FunctionName: this._action.source.original,
      Payload: JSON.stringify(this.payload),
    };

    this._lambda.invoke(invocationParameters, function(error, data) {
      callback(new LambdaResponse(this, data, error));
    }.bind(this));

    return this;
  }

  /**
   * @param {Function} callback
   * @returns {Request}
   * @private
   */
  _sendExternal(callback = () => null) {
    Http[this._method.toLowerCase()](this._action.source.original)
      .send(this.payload)
      .end(function(error, response) {
        callback(new SuperagentResponse(this, response, error));
      }.bind(this));

    return this;
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
