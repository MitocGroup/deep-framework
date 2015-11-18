'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {Resource} from '../../lib.compiled/Resource';
import {Action} from '../../lib.compiled/Resource/Action';
import {Response} from '../../lib.compiled/Resource/Response';
import {SuperagentResponse} from '../../lib.compiled/Resource/SuperagentResponse';
import {LambdaResponse} from '../../lib.compiled/Resource/LambdaResponse';
import {Instance} from '../../lib.compiled/Resource/Instance';
import {MissingCacheImplementationException} from '../../lib.compiled/Resource/Exception/MissingCacheImplementationException';
import {DirectLambdaCallDeniedException} from '../../lib.compiled/Resource/Exception/DirectLambdaCallDeniedException';
import {Exception} from '../../lib.compiled/Exception/Exception';
import {CachedRequestException} from '../../lib.compiled/Resource/Exception/CachedRequestException';
import Kernel from 'deep-kernel';
import Cache from 'deep-cache';
import Security from 'deep-security';
import KernelFactory from '../common/KernelFactory';
import requireProxy from 'proxyquire';
import AWS from 'mock-aws';
import {HttpMock} from '../Mock/HttpMock';
import {Request} from '../../lib.compiled/Resource/Request';
import {CacheMock} from '../Mock/CacheMock';

chai.use(sinonChai);

suite('Resource/Request', function() {
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

  test('Class Request exists in Resource/Request', function() {
    chai.expect(typeof Request).to.equal('function');
  });

  test('Load Kernel by using Kernel.load()', function(done) {
    let callback = (backendKernel) => {
      chai.assert.instanceOf(
        backendKernel, Kernel, 'backendKernel is an instance of Kernel');
      backendKernelInstance = backendKernel;
      action = backendKernel.get('resource').get(
        `@${microserviceIdentifier}:${resourceName}:${actionName}`
      );
      resource = backendKernel.get('resource').get(
        `@${microserviceIdentifier}:${resourceName}`
      );
      security = backendKernel.get('security');

      chai.assert.instanceOf(
        action, Action, 'action is an instance of Action'
      );
      chai.assert.instanceOf(
        resource, Instance, 'resource is an instance of Instance'
      );
      chai.assert.instanceOf(
        security, Security, 'security is an instance of Security'
      );

      request = new Request(action, payload, method);

      // complete the async
      done();

    };

    KernelFactory.create({
      Cache: Cache,
      Security: Security,
      Resource: Resource,
    }, callback);
  });

  test('Check security.anonymousLogin()', function(done) {
    let callback = (error, token) => {

      chai.expect(token.constructor.name).to.equal('LocalToken');

      // complete the async
      done();
    };

    security.localBackend = true;
    security.anonymousLogin(callback);
  });

  test(`Check method getter returns ${method}`, function() {
    chai.expect(request.method).to.be.equal(method);
  });

  test('Check method getter returns valid instance of Action', function() {
    chai.assert.instanceOf(
      action, Action, 'action is an instance of Action'
    );
    chai.expect(request.action).to.be.eql(action);
  });

  test('Check payload getter returns valid value', function() {
    chai.expect(request.payload).to.be.equal(payload);
  });

  test('Check constructor sets valid value for _lambda=null', function() {
    chai.expect(request._lambda).to.be.equal(null);
  });

  test('Check constructor sets valid value for _native=false', function() {
    chai.expect(request.native).to.be.equal(false);
  });

  test('Check constructor sets valid value for _cacheImpl=null', function() {
    chai.expect(request.cacheImpl).to.be.equal(null);
  });

  test(`Check constructor sets cacheTtl to ${Request.TTL_FOREVER}`, function() {
    chai.expect(request.cacheTtl).to.be.equal(Request.TTL_FOREVER);
  });

  test('Check constructor sets valid value for _cached=false', function() {
    chai.expect(request._cached).to.be.equal(false);
  });

  test('Check isCached getter returns false', function() {
    chai.expect(request.isCached).to.be.equal(null);
  });

  test('Check cacheTtl setter sets value', function() {
    let cacheTtl = 120;
    request.cacheTtl = cacheTtl;
    chai.expect(request.cacheTtl).to.be.equal(cacheTtl);
  });

  test('Check enableCache/disableCache methods', function() {
    request.disableCache();
    chai.expect(request._cached).to.be.equal(false);

    request.enableCache();
    chai.expect(request._cached).to.be.equal(true);
  });

  test(
    'Check cache() throws "MissingCacheImplementationException" for !_cacheImpl',
    function() {
      let error = null;

      try {
        request.cache();
      } catch (e) {
        error = e;
      }

      chai.expect(error).to.an.instanceof(MissingCacheImplementationException);
    }
  );

  test('Check TTL_DEFAULT static getter returns value above -1', function() {
    chai.expect(Request.TTL_DEFAULT).to.be.above(0);
  });

  test('Check TTL_INVALIDATE static getter returns value -1', function() {
    chai.expect(Request.TTL_INVALIDATE).to.be.equal(-1);
  });

  test('Check TTL_FOREVER static getter returns value above -1', function() {
    chai.expect(Request.TTL_FOREVER).to.be.above(-1);
  });

  test(
    'Check _rebuildResponse() throws "CachedRequestException" for invalid rawData',
    function() {
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

  test('Check _rebuildResponse() throws "Exception"', function() {
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

  test('Check _rebuildResponse() returns instance of Response', function() {
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
    function() {
      let className = 'TestClass';
      let actualResult = Request._chooseResponseImpl(className);

      chai.expect(actualResult).to.be.equal(undefined);
    }
  );

  test('Check _chooseResponseImpl() for className = Response', function() {
    let className = 'Response';
    let actualResult = Request._chooseResponseImpl(className);

    chai.expect(actualResult.name).to.be.equal(className);
  });

  test(
    'Check _chooseResponseImpl() for className = LambdaResponse',
    function() {
      let className = 'LambdaResponse';
      let actualResult = Request._chooseResponseImpl(className);

      chai.expect(actualResult.name).to.be.equal(className);
    }
  );

  test(
    'Check _chooseResponseImpl() for className = SuperagentResponse',
    function() {
      let className = 'SuperagentResponse';
      let actualResult = Request._chooseResponseImpl(className);

      chai.expect(actualResult.name).to.be.equal(className);
    });

  test('Check _stringifyResponse() method', function() {
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
    function() {
      let actualResult = request._buildCacheKey();
      let endpoint = request.native ? action.source.original : action.source.api;
      let expectedResult = `${method}:${action.type}:${endpoint}#${Request._md5(JSON.stringify(payload))}`;
      chai.expect(actualResult).to.be.equal(expectedResult);
    }
  );

  test('Check cacheImpl() setter sets valid value', function() {
    let cache = new CacheMock();
    request.cacheImpl = cache;
    chai.expect(request.cacheImpl).to.be.equal(cache);
    chai.expect(request.cacheTtl).to.be.equal(Request.TTL_DEFAULT);
  });

  test(
    'Check useDirectCall() throws "DirectLambdaCallDeniedException" for action.forceUserIdentity',
    function() {
      let error = null;
      let actualResult = null;

      try {
        actualResult = request.useDirectCall();
      } catch (e) {
        error = e;
      }

      chai.assert.instanceOf(
        error,
        DirectLambdaCallDeniedException,
        'error is an instance of DirectLambdaCallDeniedException'
      );
      chai.expect(request.native).to.be.equal(false);
    }
  );

  test('Check invalidateCache() !isCached', function() {
    let spyCallback = sinon.spy();

    request.disableCache();
    chai.expect(request.isCached).to.be.equal(false);

    request.invalidateCache(spyCallback);
    chai.expect(spyCallback).to.have.been.calledWithExactly(true);
  });

  test(
    'Check invalidateCache() throws "CachedRequestException" in has() method',
    function() {

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
    function() {

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
    function() {
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
    function() {
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

  test('Check send() external for !isCashed', function() {
    let spyCallback = sinon.spy();
    let externalAction = new Action(
      resource, actionName, Action.EXTERNAL, [method], source, region, false
    );

    //mocking Http
    httpMock.fixBabelTranspile();
    let requestExport = requireProxy('../../lib.compiled/Resource/Request', {
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

  test('Check send() external for isCashed', function() {
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
    function() {
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

  test('Check send() throws "CachedRequestException" in get() for isCashed', function() {
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

  test('Check send() throws "CachedRequestException" in set() for isCashed', function() {
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
    function() {
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

  test('Check _send() throws "Exception"', function() {
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

  test('Check _send() for lambda', function() {
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

  test('Check _send() calls _sendThroughApi() method', function() {
    let spyCallback = sinon.spy();
    let action = new Action(
      resource, actionName, Action.LAMBDA, method, source, region
    );

    //mocking Http
    httpMock.fixBabelTranspile();
    let requestExport = requireProxy('../../lib.compiled/Resource/Request', {
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

    let actualResult = spyCallback.args[0][0];

    chai.expect(spyCallback).to.have.been.calledWith();
    chai.assert.instanceOf(
      actualResult,
      SuperagentResponse,
      'result is an instance of SuperagentResponse'
    );
  });
});
