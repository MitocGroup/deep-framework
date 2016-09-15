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
import {NotAuthenticatedException} from './Exception/NotAuthenticatedException';
import aws4 from 'aws4';
import urlParse from 'url-parse';
import qs from 'qs';
import Core from 'deep-core';
import {MissingSecurityServiceException} from './Exception/MissingSecurityServiceException';
import {AsyncCallNotAvailableException} from './Exception/AsyncCallNotAvailableException';
import {LambdaParamsCompatibilityException} from './Exception/LambdaParamsCompatibilityException';
import {LoadCredentialsException} from './Exception/LoadCredentialsException';
import {SourceNotAvailableException} from './Exception/SourceNotAvailableException';
import crypto from 'crypto';
import util from 'util';

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
    this._lambda = new AWS.Lambda();

    this._cacheImpl = null;
    this._cacheTtl = Request.TTL_FOREVER;
    this._cached = false;
    this._publicCached = false;

    this._async = false;
    this._xhrAsync = true; // it's passed to httpOptions.xhrAsync option of AWS Service
    this._native = false;

    this._validationSchemaName = null;

    this._customId = null;
    this._returnLogs = false;

    this._withUserCredentials = true;
    this._authScope = this._buildAuthScope();

    this._apiKey = null;
  }

  /**
   * @returns {Request}
   */
  skipLoadingCredentials() {
    this._withUserCredentials = false;

    return this;
  }

  /**
   * @returns {Boolean}
   */
  get withUserCredentials() {
    if (this.action.scope === 'private') {
      this._withUserCredentials = false;
    }

    return this._withUserCredentials;
  }

  /**
   * @returns {Request}
   */
  skipPreValidation() {
    this._validationSchemaName = null;

    return this;
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
   * @returns {Boolean}
   */
  get async() {
    return this._async;
  }

  /**
   * @returns {Boolean}
   */
  get xhrAsync() {
    return this._xhrAsync;
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
   * @returns {String}
   */
  get customId() {
    if (!this._customId) {
      this._customId = Request._md5(this._buildCacheKey() + new Date().getTime());
    }

    return this._customId;
  }

  /**
   * @returns {Request}
   */
  invokeAsync() {
    if (!this.isLambda) {
      throw new AsyncCallNotAvailableException(this._action.type);
    }

    if (this._returnLogs) {
      throw new LambdaParamsCompatibilityException({
        InvocationType: 'Event',
        LogType: 'Tail',
      });
    }

    this._native = true;
    this._async = true;

    return this;
  }

  /**
   * @param {Boolean} flag
   *
   * @returns {Request}
   */
  httpXhrAsync(flag) {
    if (!this.isLambda) {
      throw new Exception('XHR sync requests are supported only for calls to lambda functions.', 400);
    }

    this._xhrAsync = !!flag;

    return this;
  }

  /**
   * @returns {Boolean}
   */
  get native() {
    return this._native;
  }

  /**
   * @param {Boolean} returnLogs
   * @returns {Request}
   */
  useDirectCall(returnLogs = false) {
    if (this._async && returnLogs) {
      throw new LambdaParamsCompatibilityException({
        InvocationType: 'Event',
        LogType: 'Tail',
      });
    }

    this._native = true;
    this._returnLogs = returnLogs;

    return this;
  }

  /**
   * @returns {Request}
   */
  usePublicCache() {
    this._publicCached = true;
    return this;
  }

  /**
   * @returns {Boolean}
   */
  get isCached() {
    return this._cacheImpl && this._cached;
  }

  /**
   * @returns {Boolean}
   */
  get isPublicCached() {
    return this._publicCached && this._cacheImpl && this._cacheImpl.shared;
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
   * @returns {Cache}
   */
  get cacheImpl() {
    return this._cacheImpl;
  }

  /**
   * @param {Cache} cache
   */
  set cacheImpl(cache) {
    this._cacheImpl = cache;

    // @todo: do we really have to force it?
    this.cache(Request.TTL_DEFAULT);
  }

  /**
   * @param {String|null} authScope
   * @returns {Request}
   */
  authScope(authScope) {
    this._authScope = authScope;

    return this;
  }

  /**
   * @param {String} key
   * @returns {Request}
   */
  apiKey(key) {
    this._apiKey = key;

    return this;
  }

  /**
   * @returns {String}
   * @private
   */
  _buildCacheKey() {
    let payload = Request._md5(JSON.stringify(this.payload));
    let endpoint = this.native ? this._action.source.original : this._action.source.api;

    return `${this._method}:${this._action.type}:${endpoint}#${payload}`;
  }

  /**
   * @param {String} str
   * @returns {String}
   */
  static _md5(str) {
    var md5sum = crypto.createHash('md5');

    md5sum.update(str);

    return md5sum.digest('hex');
  }

  /**
   * @param {Response} response
   * @returns {String}
   * @private
   */
  static _stringifyResponse(response) {
    return JSON.stringify({
      _class: response.constructor.name,
      data: {
        body: response.rawData.body,
        status: response.rawData.status,
        headers: response.rawData.headers
      },
      error: response.rawError,
      headers: response.headers,
    });
  }

  /**
   * @param {String|Object} rawData
   * @returns {Response}
   * @private
   */
  _rebuildResponse(rawData) {
    let response = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;

    if (!response) {
      throw new CachedRequestException(`Unable to unpack cached JSON object from ${rawData}`);
    }

    if (response._class) {
      let ResponseImpl = Request._chooseResponseImpl(response._class);

      if (!ResponseImpl) {
        throw new Exception(`Unknown Response implementation ${response._class}`);
      }

      return new ResponseImpl(this, response.data, response.error);
    }

    return new SuperagentResponse(this, response, null);
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
   *
   * @param {Function} callback
   * @returns {Request}
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
   * @returns {Request}
   */
  send(callback = () => {}) {
    let cache = this.cacheImpl;
    let cacheKey = this._buildCacheKey();

    if (!this.isCached || this._async || (this.cacheTtl === Request.TTL_INVALIDATE)) {
      return this._send(callback);
    }
    
    this._loadResponseFromCache(cache, cacheKey, (error, response) => {
      if (!error) {
        callback(response);
        return;
      }

      if (this.isPublicCached) {
        let publicCache = cache.shared;
        let publicCacheKey = publicCache.buildKeyFromRequest(this);

        this._loadResponseFromCache(publicCache, publicCacheKey, (error, response) => {
          if (!error) {
            callback(response);
            return;
          }

          this._send(callback);
        });

      } else {
        this._send(callback);
      }
    });

    return this;
  }

  /**
   * @param {Function} callback
   * @returns {Request}
   */
  _send(callback = () => {}) {
    let logService = this.action.resource.log;
    let requestEvent = {
      service: 'deep-resource',
      resourceType: 'Browser',
      resourceId: this.native ? this.action.source.original : this.action.source.api,
      eventName: this.method,
      eventId: this.customId,
      requestId: this.customId,
      time: Date.now(),
    };

    let decoratedCallback = (response) => {
      if (this.method.toUpperCase() === 'GET') {
        this._saveResponseToCache(response);
      }

      requestEvent.requestId = requestEvent.mainRequestId = response.requestId;

      let responseEvent = util._extend({}, requestEvent);
      responseEvent.payload = response;
      responseEvent.time = Date.now();

      logService.rumLog(requestEvent);
      logService.rumLog(responseEvent);

      callback(response);
    };

    if (this.validationSchemaName) {
      let result = this._validate();

      if (result.error) {
        return decoratedCallback(this._createValidationErrorResponse(result.error));
      }
    }

    this._fillPayloadWithSystemData();

    if (!this._native) {
      return this._sendThroughApi(decoratedCallback);
    }

    switch (this._action.type) {
      case Action.LAMBDA:
        if (!this._action.isOriginalSourceInvokable) {
          throw new SourceNotAvailableException(Action.LAMBDA, this._action);
        }

        this._sendLambda(decoratedCallback);
        break;
      case Action.EXTERNAL:
        if (!this._action.isApiSourceInvokable) {
          throw new SourceNotAvailableException(Action.EXTERNAL, this._action);
        }

        this._sendExternal(decoratedCallback);
        break;
      default: throw new Exception(`Request of type ${this._action.type} is not implemented`);
    }

    return this;
  }

  /**
   * @returns {Request}
   * @private
   */
  _fillPayloadWithSystemData() {
    let resource = this.action.resource;

    if (!resource.isBackend || !resource.log.isRumEnabled()) {
      return this;
    }

    let runtimeContext = resource.contextProvider.context;

    this._payload.lambdaDepthLevel = (runtimeContext.getDeepFrameworkOption('lambdaDepthLevel') || 0) + 1;
    this._payload.mainRequestId = runtimeContext.getDeepFrameworkOption('mainRequestId') ||
      runtimeContext.awsRequestId;

    return this;
  }

  /**
   * @param {Object} response
   * @param {Function} callback
   * @private
   */
  _saveResponseToCache(response, callback = () => {}) {
    if (!this.isCached || this.async || (this.cacheTtl === Request.TTL_INVALIDATE) || response.isError) {
      callback(null, response);
      return;
    }

    let cacheKey = this._buildCacheKey();
    let logService = this.action.resource.log;

    let event = {
      service: 'deep-cache',
      resourceType: this.cacheImpl.type(),
      resourceId: cacheKey,
      eventName: 'set',
      requestId: response.requestId,
    };

    logService.rumLog(event);

    this.cacheImpl.set(cacheKey, Request._stringifyResponse(response), this.cacheTtl, (error, result) => {
      event = util._extend({}, event);
      event.payload = {error, result,};
      logService.rumLog(event);

      if (!error && !result) {
        error = `Unable to persist request cache under key ${cacheKey}.`;
      }

      if (error) {
        error = new CachedRequestException(error);
      }

      callback(error, result);

      return;
    });
  }

  /**
   * @param {Object} driver
   * @param {String|Key} key
   * @param {Function} callback
   */
  _loadResponseFromCache(driver, key, callback) {
    driver.has(key, (err, has) => {
      if(err) {
        callback(new CachedRequestException(`Error to check if has in cache key ${key}`));
        return;
      }

      if (has) {
        let logService = this.action.resource.log;

        let event = {
          service: 'deep-cache',
          resourceType: driver.type(),
          resourceId: key,
          eventName: 'get',
          requestId: this.customId,
        };

        logService.rumLog(event);

        driver.get(key, (err, data) => {
          event = util._extend({}, event);
          event.payload = {err, data,};

          logService.rumLog(event);

          if (err) {
            callback(err, null);

            return;
          }

          callback(null, this._rebuildResponse(data));
        });

        return;
      }

      callback(new CachedRequestException(`Missing key ${key}`), null);
    });
  }

  /**
   * @returns {Object}
   * @private
   */
  _validate() {
    if (!this.validationSchemaName) {
      throw new Exception('Error on validating request. Validation schema is not defined.');
    }

    return this.action.resource.validation.validate(
      this.validationSchemaName, this.payload, true
    );
  }

  /**
   * @param {Error} validationError
   *
   * @returns {LambdaResponse}
   * @private
   */
  _createValidationErrorResponse(validationError) {
    return new LambdaResponse(this, {
      errorMessage: JSON.stringify({
        errorType: validationError.name,
        errorMessage: validationError.annotate(),
        errorStack: validationError.stack || (new Error(validationError.message)).stack,
        validationErrors: validationError.details,
      })
    }, null);
  }

  /**
   * @param {Function} callback
   * @returns {Request}
   * @private
   */
  _sendThroughApi(callback = () => {}) {
    let endpoint = this.action.source.api;
    let headers = {};

    let sendRequestFunc = (request) => {
      request.end((error, response) => {
        callback(new SuperagentResponse(this, response, error));
      });
    };

    // make sure apiKey is set for endpoints that requires it
    if (this.action.apiKeyRequired) {
      if (!this._apiKey) {
        callback(new SuperagentResponse(
          this, null, new Error('Missing required api key parameter.')
        ));

        return this;
      }

      headers = {'x-api-key': this._apiKey};
    }

    if (this.action.apiAuthType === Action.API_AWS_IAM_AUTH) {
      this._createAws4SignedRequest(endpoint, this.method, this.payload, headers, (error, signedRequest) => {
        if (error) {
          callback(new SuperagentResponse(this, null, error));
          return this;
        }

        sendRequestFunc(signedRequest);
      });
    } else {
      sendRequestFunc(
        this._createBasicHttpRequest(endpoint, this.method, this.payload, headers)
      )
    }

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

    let options = {
      region: this._action.region,
      httpOptions: {
        xhrAsync: this.xhrAsync
      },
    };

    let invocationParameters = {
      FunctionName: this._action.source.original,
      Payload: JSON.stringify(this.payload),
      InvocationType: this._async ? 'Event' : 'RequestResponse',
      LogType: this._returnLogs ? 'Tail' : 'None',
    };

    if (!this.withUserCredentials) {
      this._invokeLambda(invocationParameters, callback);
    } else {
      this._loadSecurityCredentials((error, credentials) => {

        // use cognito identity credentials if present
        // if not, fallback to lambda execution role permissions
        if (!error && credentials) {
          options.credentials = credentials;
        }

        this._lambda = new AWS.Lambda(options);

        this._invokeLambda(invocationParameters, callback);
      });
    }

    return this;
  }

  /**
   * @param {Object} invocationParameters
   * @param {Function} callback
   * @private
   */
  _invokeLambda(invocationParameters, callback) {
    let _this = this;

    // @note - don't replace this callback function with an arrow one
    // (we need injected context to access AWS.Response)
    this._lambda.invoke(invocationParameters, function(error, data) {
      let lambdaResponse = new LambdaResponse(_this, data, error);
      lambdaResponse.originalResponse = this; // this is an instance of AWS.Response

      callback(lambdaResponse);
    });
  }

  /**
   * @param {String} url
   * @param {String} method
   * @param {*} payload
   * @param {*} headers
   * @returns {*}
   * @private
   */
  _createBasicHttpRequest(url, method = this.method, payload = this.payload, headers = {}) {
    let request = Http[Request._httpRealMethod(method)](url, payload);

    for (let headerName in headers) {
      if (!headers.hasOwnProperty(headerName)) {
        continue;
      }

      request.set(headerName, headers[headerName]);
    }

    return request;
  }

  /**
   * @param {Function} callback
   * @returns {Request}
   * @private
   */
  _sendExternal(callback = () => {}) {
    this._createBasicHttpRequest(this._action.source.original)
      .send()
      .end((error, response) => {
        callback(new SuperagentResponse(this, response, error));
      });

    return this;
  }

  /**
   * @param {String} url
   * @param {String} httpMethod
   * @param {Object} payload
   * @param {Object} headers
   * @param {Function} callback
   * @private
   */
  _createAws4SignedRequest(url, httpMethod, payload, headers, callback) {
    let parsedUrl = urlParse(url, qs);
    let apiHost = parsedUrl.hostname;
    let apiPath = parsedUrl.pathname ? parsedUrl.pathname : '/';

    headers = util._extend(headers, {
      'Content-Type': 'application/json; charset=UTF-8',
    });

    let opsToSign = {
      service: Core.AWS.Service.API_GATEWAY_EXECUTE,
      region: this.getEndpointHostRegion(apiHost),
      host: apiHost,
      method: httpMethod,
      path: apiPath,
      headers: util._extend({}, headers), // clone headers object not to be changed by aws4.sign method
    };

    httpMethod = httpMethod.toLowerCase();

    switch (httpMethod) {
      case 'get':
      case 'delete':
        if (parsedUrl.query || payload) {
          //assure parsedUrl.query is a valid object
          if (parsedUrl.query === null || typeof parsedUrl.query !== 'object') {
            parsedUrl.query = {};
          }

          let mergedPayload = util._extend(parsedUrl.query, payload);

          if (this.action.apiCacheEnabled) {
            mergedPayload[Action.DEEP_CACHE_QS_PARAM] = Request._md5(qs.stringify(mergedPayload));
          }

          opsToSign.path += `?${qs.stringify(mergedPayload)}`;

          // pass payload as query string
          parsedUrl.set('query', mergedPayload, qs.parse);
          url = parsedUrl.toString(qs.stringify);
          payload = null; // reset it coz superagent overrides url query string
        }
        break;
      case 'post':
      case 'put':
      case 'patch':
        opsToSign.body = JSON.stringify(payload);
        break;
    }

    this._loadSecurityCredentials((error, credentials) => {
      if (error) {
        callback(error);
        return;
      }

      let signature = aws4.sign(opsToSign, credentials);
      let request = this._createBasicHttpRequest(url, httpMethod, payload, headers);

      // Adding aws4 required headers
      ['X-Amz-Date', 'X-Amz-Security-Token', 'Authorization'].forEach(header => {
        request.set(header, signature.headers[header]);
      });

      if (this.action.resource.isBackend && signature.headers.hasOwnProperty('Content-Length')) {
        request.set('Content-Length', signature.headers['Content-Length']);
      }

      callback(null, request);
    });
  }

  /**
   * @param {String} httpMethod
   * @returns {String}
   * @private
   */
  static _httpRealMethod(httpMethod) {
    let method = httpMethod.toLowerCase();

    // @see https://visionmedia.github.io/superagent/
    if (method === 'delete') {
      method = 'del';
    }

    return method;
  }

  /**
   * @param {Function} callback
   * @returns {Request}
   * @private
   */
  _loadSecurityCredentials(callback) {
    let securityService = this._action.resource.security;

    if (!securityService) {
      callback(new MissingSecurityServiceException(), null);
      return this;
    }

    if (!securityService.token) {
      callback(new NotAuthenticatedException(), null);
      return this;
    }

    securityService.token.loadCredentials((error, credentials) => {
      if (error) {
        callback(new LoadCredentialsException(error), null);
        return;
      }

      callback(null, credentials);
    }, this._authScope);

    return this;
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
   * @return {String}
   */
  _buildAuthScope() {
    let action = this._action;
    let resource = action.resource;
    let microservice = resource.microservice;

    return `${microservice.identifier}:${resource.name}:${action.name}`;
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
