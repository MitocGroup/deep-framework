'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {Resource} from '../../lib/Resource';
import {Action} from '../../lib/Resource/Action';
import {Response} from '../../lib/Resource/Response';
import {SuperagentResponse} from '../../lib/Resource/SuperagentResponse';
import {LambdaResponse} from '../../lib/Resource/LambdaResponse';
import {Instance} from '../../lib/Resource/Instance';
import {MissingCacheImplementationException} from '../../lib/Resource/Exception/MissingCacheImplementationException';
import {Exception} from '../../lib/Exception/Exception';
import {CachedRequestException} from '../../lib/Resource/Exception/CachedRequestException';
import {MissingSecurityServiceException} from '../../lib/Resource/Exception/MissingSecurityServiceException';
import {NotAuthenticatedException} from '../../lib/Resource/Exception/NotAuthenticatedException';
import {LoadCredentialsException} from '../../lib/Resource/Exception/LoadCredentialsException';
import Kernel from 'deep-kernel';
import Cache from 'deep-cache';
import Security from 'deep-security';
import Validation from 'deep-validation';
import KernelFactory from '../common/KernelFactory';
import requireProxy from 'proxyquire';
import AWS from 'mock-aws';
import {HttpMock} from '../Mock/HttpMock';
import {Request} from '../../lib/Resource/Request';
import {CacheMock} from '../Mock/CacheMock';

chai.use(sinonChai);

suite('Resource/Request', () => {
  let backendKernelInstance = null;
  let action = null;
  let request = null;
  let resource = null;
  let externalRequest = null;
  let security = null;
  let microserviceIdentifier = 'hello.world.example';
  let resourceName = 'sample';
  let actionName = 'say-hello';
  let payload = '{"body":"bodyData"}';
  let source = {
    api: 'https://1zf47jpvxd.execute-api.us-west-2.amazonaws.com/dev/hello-world-example/sample/say-hello',
    original: 'arn:aws:lambda:us-west-2:389615756922:function:DeepDevSampleSayHello64232f3705a',
  };
  let region = 'us-west-2';
  let method = 'POST';
  let httpMock = new HttpMock();

  test('Class Request exists in Resource/Request', () => {
    chai.expect(Request).to.be.an('function');
  });

  test('Load Kernel by using Kernel.load()', (done) => {
    let callback = (backendKernel) => {
      chai.assert.instanceOf(
        backendKernel, Kernel, 'backendKernel is an instance of Kernel'
      );

      backendKernelInstance = backendKernel;

      // complete the async
      done();

    };

    KernelFactory.create({
      Cache: Cache,
      Security: Security,
      Resource: Resource,
      Validation: Validation,
    }, callback);
  });

  test('Check getting action from Kernel instance', () => {
    action = backendKernelInstance.get('resource').get(
      `@${microserviceIdentifier}:${resourceName}:${actionName}`
    );

    chai.assert.instanceOf(
      action, Action, 'action is an instance of Action'
    );
  });

  test('Check getting resource from Kernel instance', () => {
    resource = backendKernelInstance.get('resource').get(
      `@${microserviceIdentifier}:${resourceName}`
    );

    chai.assert.instanceOf(
      resource, Instance, 'resource is an instance of Instance'
    );
  });

  test('Check Request constructor', () => {
    request = new Request(action, payload, method);

    chai.assert.instanceOf(
      request, Request, 'resource is an instance of Request'
    );
  });

  test('Check getting security from Kernel instance', () => {
    security = backendKernelInstance.get('security');

    chai.assert.instanceOf(
      security, Security, 'security is an instance of Security'
    );
  });

  test('Check security.anonymousLogin()', (done) => {
    let callback = (error, token) => {

      chai.expect(token.constructor.name).to.equal('LocalToken');

      // complete the async
      done();
    };

    security.localBackend = true;
    security.anonymousLogin(callback);
  });

  test(`Check method getter returns ${method}`, () => {
    chai.expect(request.method).to.be.equal(method);
  });

  test('Check method getter returns valid instance of Action', () => {
    chai.assert.instanceOf(
      action, Action, 'action is an instance of Action'
    );
    chai.expect(request.action).to.be.eql(action);
  });

  test('Check payload getter returns valid value', () => {
    chai.expect(request.payload).to.be.equal(payload);
  });

  test('Check constructor sets valid value for _lambda=null', () => {
    chai.expect(request._lambda).to.be.equal(null);
  });

  test('Check constructor sets valid value for _native=false', () => {
    chai.expect(request.native).to.be.equal(false);
  });

  test('Check constructor sets valid value for _cacheImpl=null', () => {
    chai.expect(request.cacheImpl).to.be.equal(null);
  });

  test(`Check constructor sets cacheTtl to ${Request.TTL_FOREVER}`, () => {
    chai.expect(request.cacheTtl).to.be.equal(Request.TTL_FOREVER);
  });

  test('Check constructor sets valid value for _cached=false', () => {
    chai.expect(request._cached).to.be.equal(false);
  });

  test('Check isCached getter returns false', () => {
    chai.expect(request.isCached).to.be.equal(null);
  });

  test('Check cacheTtl setter sets value', () => {
    let cacheTtl = 120;
    request.cacheTtl = cacheTtl;
    chai.expect(request.cacheTtl).to.be.equal(cacheTtl);
  });

  test('Check enableCache/disableCache methods', () => {
    request.disableCache();
    chai.expect(request._cached).to.be.equal(false);

    request.enableCache();
    chai.expect(request._cached).to.be.equal(true);
  });

  test(
    'Check cache() throws "MissingCacheImplementationException" for !_cacheImpl',
    () => {
      let error = null;

      try {
        request.cache();
      } catch (e) {
        error = e;
      }

      chai.expect(error).to.an.instanceof(MissingCacheImplementationException);
    }
  );

  test('Check TTL_DEFAULT static getter returns value above -1', () => {
    chai.expect(Request.TTL_DEFAULT).to.be.above(0);
  });

  test('Check TTL_INVALIDATE static getter returns value -1', () => {
    chai.expect(Request.TTL_INVALIDATE).to.be.equal(-1);
  });

  test('Check TTL_FOREVER static getter returns value above -1', () => {
    chai.expect(Request.TTL_FOREVER).to.be.above(-1);
  });

  test(
    'Check _rebuildResponse() throws "CachedRequestException" for invalid rawData',
    () => {
      let error = null;
      let rawData = 'null';

      try {
        request._rebuildResponse(rawData);
      } catch (e) {
        error = e;
      }

      chai.expect(error).to.be.an.instanceof(CachedRequestException);
    }
  );

  test('Check _rebuildResponse() throws "Exception"', () => {
    let rawData = '{ "_class":"TestResponseMessage"}';
    let error = null;

    try {
      request._rebuildResponse(rawData);
    } catch (e) {
      error = e;
    }

    chai.assert.instanceOf(
      error, Exception, 'result is an instance of Exception'
    );
    chai.expect(error.message).to.be.equal(
      'Unknown Response implementation TestResponseMessage'
    );
  });

  test('Check _rebuildResponse() returns instance of Response', () => {
    let rawData = '{"status":200,"message":"Test message","_class":"Response"}';
    let error = null;
    let actualResult = null;

    try {
      actualResult = request._rebuildResponse(rawData);
    } catch (e) {
      error = e;
    }

    chai.assert.instanceOf(
      actualResult, Response, 'result is an instance of Response'
    );
  });

  test('Check _chooseResponseImpl() returns undefined for invalid className',
    () => {
      let className = 'TestClass';
      let actualResult = Request._chooseResponseImpl(className);

      chai.expect(actualResult).to.be.equal(undefined);
    }
  );

  test('Check _chooseResponseImpl() for className = Response', () => {
    let className = 'Response';
    let actualResult = Request._chooseResponseImpl(className);

    chai.expect(actualResult.name).to.be.equal(className);
  });

  test(
    'Check _chooseResponseImpl() for className = LambdaResponse',
    () => {
      let className = 'LambdaResponse';
      let actualResult = Request._chooseResponseImpl(className);

      chai.expect(actualResult.name).to.be.equal(className);
    }
  );

  test(
    'Check _chooseResponseImpl() for className = SuperagentResponse',
    () => {
      let className = 'SuperagentResponse';
      let actualResult = Request._chooseResponseImpl(className);

      chai.expect(actualResult.name).to.be.equal(className);
    });

  test('Check _stringifyResponse() method', () => {
    let requestData = 'responseTest';
    let rawData = {Payload: '{"dataKey":"testResponseValue"}', StatusCode: 201};
    let rawError = null;

    let response = new Response(requestData, rawData, rawError);
    let actualResult = JSON.parse(Request._stringifyResponse(response));

    chai.expect(actualResult._class).to.be.equal('Response');
    chai.expect(actualResult.data).to.be.eql(rawData);
    chai.expect(actualResult.error).to.be.equal(rawError);
  });

  test(
    'Check _buildCacheKey() method returns valid cache key',
    () => {
      let actualResult = request._buildCacheKey();
      let endpoint = request.native ? action.source.original : action.source.api;
      let expectedResult = `${method}:${action.type}:${endpoint}#${Request._md5(JSON.stringify(payload))}`;
      chai.expect(actualResult).to.be.equal(expectedResult);
    }
  );

  test('Check cacheImpl() setter sets valid value', () => {
    let cache = new CacheMock();
    request.cacheImpl = cache;
    chai.expect(request.cacheImpl).to.be.equal(cache);
    chai.expect(request.cacheTtl).to.be.equal(Request.TTL_DEFAULT);
  });

  test('Check invalidateCache() !isCached', () => {
    let spyCallback = sinon.spy();

    request.disableCache();
    chai.expect(request.isCached).to.be.equal(false);

    request.invalidateCache(spyCallback);
    chai.expect(spyCallback).to.have.been.calledWithExactly(true);
  });

  test(
    'Check invalidateCache() throws "CachedRequestException" in has() method',
    () => {

      let error = null;
      let spyCallback = sinon.spy();
      let cache = new CacheMock();

      //sets mock mode
      cache.setMode(CacheMock.FAILURE_MODE, ['has']);

      request.cacheImpl = cache;
      request.enableCache();

      try {
        request.invalidateCache(spyCallback);
      } catch (e) {
        error = e;
      }

      chai.assert.instanceOf(
        error,
        CachedRequestException,
        'error is an instance of CachedRequestException'
      );
    }
  );

  test(
    'Check invalidateCache() throws "CachedRequestException" in invalidate()',
    () => {

      let error = null;
      let spyCallback = sinon.spy();
      let cache = new CacheMock();

      //sets mock mode
      cache.setMode(CacheMock.DATA_MODE, ['has']);
      cache.setMode(CacheMock.FAILURE_MODE, ['invalidate']);

      request.cacheImpl = cache;
      request.enableCache();

      try {
        request.invalidateCache(spyCallback);
      } catch (e) {
        error = e;
      }

      chai.assert.instanceOf(
        error,
        CachedRequestException,
        'error is an instance of CachedRequestException'
      );
    }
  );

  test(
    'Check invalidateCache() returns valid result in callback',
    () => {
      let spyCallback = sinon.spy();
      let cache = new CacheMock();

      //sets mock mode
      cache.setMode(CacheMock.DATA_MODE, ['has', 'invalidate']);

      request.cacheImpl = cache;
      request.enableCache();
      request.invalidateCache(spyCallback);

      chai.expect(spyCallback).to.have.been.calledWithExactly(CacheMock.DATA);
    }
  );

  test('Check invalidateCache() isCached with no results in has methods',
    () => {
      let spyCallback = sinon.spy();
      let cache = new CacheMock();

      //sets mock mode
      cache.setMode(CacheMock.NO_RESULT_MODE, ['has']);

      request.cacheImpl = cache;
      request.enableCache();
      request.invalidateCache(spyCallback);

      chai.expect(spyCallback).to.have.been.calledWithExactly(true);
    }
  );

  test('Check send() external for !isCashed', () => {
    let spyCallback = sinon.spy();
    let externalAction = new Action(
      resource, actionName, Action.EXTERNAL, [method], source, region, false
    );

    //mocking Http
    httpMock.fixBabelTranspile();
    let requestExport = requireProxy('../../lib/Resource/Request', {
      'superagent': httpMock,
    });
    let RequestProxy = requestExport.Request;
    externalRequest = new RequestProxy(externalAction, payload, method);

    httpMock.setMode(HttpMock.DATA_MODE, ['end']);
    externalRequest.useDirectCall();
    externalRequest.send(spyCallback);

    let actualResult = spyCallback.args[0][0];
    chai.expect(typeof actualResult).to.equal('object');
    chai.expect(actualResult.constructor.name).to.equal('SuperagentResponse');
  });

  test('Check send() external for isCashed', () => {
    let spyCallback = sinon.spy();

    //set cache mock mode
    let cache = new CacheMock();
    cache.setMode(CacheMock.NO_RESULT_MODE, ['has']);
    cache.setMode(CacheMock.DATA_MODE, ['set']);

    externalRequest.cacheImpl = cache;
    externalRequest.enableCache();
    externalRequest.useDirectCall();

    //set http mock mode
    httpMock.setMode(HttpMock.DATA_MODE, ['end']);

    externalRequest.send(spyCallback);

    let actualResult = spyCallback.args[0][0];
    chai.expect(typeof actualResult).to.equal('object');
    chai.expect(actualResult.constructor.name).to.equal('SuperagentResponse');
  });

  test('Check send() throws "CachedRequestException" in has() for isCashed',
    () => {
      let spyCallback = sinon.spy();
      let error = null;

      //set cache mock mode
      let cache = new CacheMock();
      cache.setMode(CacheMock.FAILURE_MODE, ['has']);
      externalRequest.cacheImpl = cache;
      externalRequest.enableCache();

      try {
        externalRequest.send(spyCallback);
      } catch (e) {
        error = e;
      }

      chai.assert.instanceOf(
        error,
        CachedRequestException,
        'error is an instance of CachedRequestException'
      );
    }
  );

  test('Check send() throws "CachedRequestException" in get() for isCashed', () => {
    let spyCallback = sinon.spy();
    let error = null;

    //set cache mock mode
    let cache = new CacheMock();
    cache.setMode(CacheMock.DATA_MODE, ['has']);
    cache.setMode(CacheMock.FAILURE_MODE, ['get']);
    externalRequest.cacheImpl = cache;
    externalRequest.enableCache();

    try {
      externalRequest.send(spyCallback);
    } catch (e) {
      error = e;
    }

    chai.assert.instanceOf(
      error,
      CachedRequestException,
      'error is an instance of CachedRequestException'
    );
  });

  test('Check send() throws "CachedRequestException" in set() for isCashed', () => {
    let spyCallback = sinon.spy();
    let error = null;

    //set cache mock mode
    let cache = new CacheMock();
    cache.setMode(CacheMock.NO_RESULT_MODE, ['has', 'set']);
    externalRequest.cacheImpl = cache;
    externalRequest.enableCache();

    //set http mock mode
    httpMock.setMode(HttpMock.DATA_MODE, ['end']);

    try {
      externalRequest.send(spyCallback);
    } catch (e) {
      error = e;
    }

    chai.assert.instanceOf(
      error,
      CachedRequestException,
      'error is an instance of CachedRequestException'
    );
  });

  test(
    'Check send() calls callback with _rebuildResponse() in has() for isCashed',
    () => {
      let spyCallback = sinon.spy();

      //set cache mock mode
      let cache = new CacheMock();
      cache.setMode(CacheMock.DATA_MODE, ['has', 'get']);
      externalRequest.cacheImpl = cache;
      externalRequest.enableCache();

      externalRequest.send(spyCallback);
      let actualResult = spyCallback.args[0][0];

      chai.assert.instanceOf(
        actualResult, Response, 'result is an instance of Response'
      );
    }
  );

  test('Check _send() throws "Exception"', () => {
    let invalidActionType = 'invalidAction';
    let invalidAction = new Action(
      resource, actionName, invalidActionType, method, source, region
    );
    let invalidRequest = new Request(invalidAction, payload, method);
    let error = null;

    try {
      invalidRequest.useDirectCall();
      invalidRequest._send();
    } catch (e) {
      error = e;
    }

    chai.assert.instanceOf(
      error, Exception, 'result is an instance of Exception'
    );
    chai.expect(error.message).to.be.equal(
      `Request of type ${invalidActionType} is not implemented`
    );
  });

  test('Check _send() for lambda', () => {
    let spyCallback = sinon.spy();
    let action = new Action(
      resource, actionName, Action.LAMBDA, method, source, region
    );
    let request = new Request(action, payload, method);

    //mocking Lambda service
    AWS.mock(
      'Lambda',       //the name of the AWS service that the method belongs
      'invoke', //the service's method to be be mocked
      {               //the test data that the mocked method should return
        Payload: '{"dataKey":"testValue"}',
        StatusCode: 201,
      }
    );

    request.useDirectCall();
    request._send(spyCallback);

    let actualResult = spyCallback.args[0][0];

    chai.expect(spyCallback).to.have.been.calledWith();
    chai.assert.instanceOf(
      actualResult, LambdaResponse, 'result is an instance of LambdaResponse'
    );
  });

  test('Check _send() calls _sendThroughApi() method', () => {
    let spyCallback = sinon.spy();
    let action = new Action(
      resource, actionName, Action.LAMBDA, method, source, region
    );

    //mocking Http
    httpMock.fixBabelTranspile();
    let requestExport = requireProxy('../../lib/Resource/Request', {
      'superagent': httpMock,
    });
    let RequestProxy = requestExport.Request;
    let request = new RequestProxy(action, payload, method);
    request.disableCache();

    httpMock.setMode(HttpMock.DATA_MODE, ['end']);

    try {
      request._send(spyCallback);
    } catch (e) {
    }

    // @todo - un comment this use case once deep-resource will be published
    let actualResult = spyCallback.args[0][0];

    chai.expect(spyCallback).to.have.been.calledWith();
    chai.assert.instanceOf(
      actualResult,
      SuperagentResponse,
      'result is an instance of SuperagentResponse'
    );
  });

  test('Check _loadSecurityCredentials throws "MissingSecurityServiceException"', () => {
    let spyCallback = sinon.spy();
    let testAction = {
      _name: 'testAction',
      resource: 'resource name',
    };
    let testRequest = new Request(testAction, payload, method);

    let actualResult = testRequest._loadSecurityCredentials(spyCallback);

    let spyCallbackArgs = spyCallback.args[0]

    chai.assert.instanceOf(actualResult, Request, 'actualResult is an instance of Request');
    chai.assert.instanceOf(
      spyCallbackArgs[0],
      MissingSecurityServiceException,
      'error is an instance of MissingSecurityServiceException'
    );
    chai.expect(spyCallbackArgs[1]).to.equal(null);
  });

  test('Check _loadSecurityCredentials throws "NotAuthenticatedException"', () => {
    let spyCallback = sinon.spy();
    let testAction = {
      _name: 'testAction',
      resource: {
        security: 'insuffcient value',
      }
    };
    let testRequest = new Request(testAction, payload, method);

    let actualResult = testRequest._loadSecurityCredentials(spyCallback);

    let spyCallbackArgs = spyCallback.args[0]

    chai.assert.instanceOf(actualResult, Request, 'actualResult is an instance of Request');
    chai.assert.instanceOf(
      spyCallbackArgs[0],
      NotAuthenticatedException,
      'error is an instance of NotAuthenticatedException'
    );
    chai.expect(spyCallbackArgs[1]).to.equal(null);
  });

  test('Check _loadSecurityCredentials throws "LoadCredentialsException"', () => {
    let spyCallback = sinon.spy();
    let testAction = {
      _name: 'testAction',
      resource: {
        security: {
          token: {
            loadCredentials: (callback) => {
              callback('mock error on loadCredentials', null);
              return;
            },
          },
        },
      },
    };
    let testRequest = new Request(testAction, payload, method);

    testRequest._loadSecurityCredentials(spyCallback);

    let spyCallbackArgs = spyCallback.args[0]
    chai.assert.instanceOf(
      spyCallbackArgs[0],
      LoadCredentialsException,
      'error is an instance of LoadCredentialsException'
    );
    chai.expect(spyCallbackArgs[1]).to.equal(null);
  });
});
