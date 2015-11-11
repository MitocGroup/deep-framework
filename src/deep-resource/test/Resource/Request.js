'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {Resource} from '../../lib.compiled/Resource';
import {Action} from '../../lib.compiled/Resource/Action';
import {Request} from '../../lib.compiled/Resource/Request';
import {Response} from '../../lib.compiled/Resource/Response';
import {MissingCacheImplementationException} from '../../lib.compiled/Resource/Exception/MissingCacheImplementationException';
import {Exception} from '../../lib.compiled/Exception/Exception';
import {CachedRequestException} from '../../lib.compiled/Resource/Exception/CachedRequestException';
import CacheMock from '../Mock/CacheMock';
import Kernel from 'deep-kernel';
import Cache from 'deep-cache';
import Security from 'deep-security';
import KernelFactory from '../common/KernelFactory';
import backendConfig from '../common/backend-cfg-json';

chai.use(sinonChai);

suite('Resource/Request', function() {
  let backendKernelInstance = null;
  let action = null;
  let request = null;
  let microserviceIdentifier = 'hello.world.example';
  let resourceName = 'sample';
  let actionName = 'say-hello';
  let payload = '{"body":"bodyData"}';
  let method = 'POST';

  test('Class Request exists in Resource/Request', function() {
    chai.expect(typeof Request).to.equal('function');
  });

  test('Load Kernel by using Kernel.load()', function(done) {
    let callback = (backendKernel) => {
      chai.assert.instanceOf(
        backendKernel, Kernel, 'backendKernel is an instance of Kernel');
      backendKernelInstance = backendKernel;
      action = backendKernel.get('resource')
        .get(`@${microserviceIdentifier}:${resourceName}:${actionName}`);

      chai.assert.instanceOf(
        action, Action, 'action is an instance of Action'
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

  //test('Check constructor sets valid value for _method', function() {
  //  chai.expect(request.method).to.be.equal(method);
  //});
  //
  //test('Check constructor sets valid value for _action', function() {
  //  chai.expect(request.action).to.be.equal(action);
  //});
  //
  //test('Check constructor sets valid value for _payload', function() {
  //  chai.expect(request.payload).to.be.equal(payload);
  //});
  //
  //test('Check constructor sets valid value for _lambda=null', function() {
  //  chai.expect(request._lambda).to.be.equal(null);
  //});
  //
  //test('Check constructor sets valid value for _native=false', function() {
  //  chai.expect(request.native).to.be.equal(false);
  //});
  //
  //test('Check constructor sets valid value for _cacheImpl=null', function() {
  //  chai.expect(request.cacheImpl).to.be.equal(null);
  //});
  //
  //test('Check constructor sets valid value for _cacheImpl=null', function() {
  //  chai.expect(request.cacheTtl).to.be.equal(Request.TTL_FOREVER);
  //});

  //test('Check cache method throws \'MissingCacheImplementationException\' exception for !_cacheImpl', function() {
  //  let error = null;
  //  try {
  //    request.cache();
  //  } catch (e) {
  //    error = e;
  //  }
  //
  //  chai.expect(error).to.be.not.equal(null);
  //  chai.expect(error).to.be.an.instanceof(MissingCacheImplementationException);
  //});
  //
  //test('Check constructor sets valid value for _cached=false', function() {
  //  chai.expect(request._cached).to.be.equal(false);
  //});
  //
  //test('Check isCached getter returns false', function() {
  //  chai.expect(request.isCached).to.be.equal(null);
  //});
  //
  //test('Check cacheTtl setter sets value', function() {
  //  let cacheTtl = 120;
  //  request.cacheTtl = cacheTtl;
  //  chai.expect(request.cacheTtl).to.be.equal(cacheTtl);
  //});
  //
  //test('Check enableCache/disableCache methods', function() {
  //  request.disableCache();
  //  chai.expect(request._cached).to.be.equal(false);
  //  request.enableCache();
  //  chai.expect(request._cached).to.be.equal(true);
  //});
  //
  //test('Check TTL_DEFAULT static getter returns value above -1', function() {
  //  chai.expect(Request.TTL_DEFAULT).to.be.above(0);
  //});
  //
  //test('Check TTL_INVALIDATE static getter returns value -1', function() {
  //  chai.expect(Request.TTL_INVALIDATE).to.be.equal(-1);
  //});
  //
  //test('Check TTL_FOREVER static getter returns value above -1', function() {
  //  chai.expect(Request.TTL_FOREVER).to.be.above(-1);
  //});
  //
  //test('Check _rebuildResponse method throws CachedRequestException exception for invalid rawData', function() {
  //  let error = null;
  //  let rawData = 'null';
  //  try {
  //    request._rebuildResponse(rawData);
  //  } catch (e) {
  //    error = e;
  //  }
  //
  //  chai.expect(error).to.be.not.equal(null);
  //  chai.expect(error).to.be.an.instanceof(CachedRequestException);
  //});
  //
  //test('Check _stringifyResponse() method', function() {
  //  let requestData = 'responseTest';
  //  let rawData = {Payload: '{"dataKey":"testResponseValue"}', StatusCode:201};
  //  let rawError = null;
  //  let error = null;
  //  let actualResult = null;
  //  let response = null;
  //
  //  try {
  //    response = new Response(requestData, rawData, rawError);
  //    actualResult = JSON.parse(Request._stringifyResponse(response));
  //  } catch (e) {
  //    error = e;
  //  }
  //
  //  chai.expect(error).to.be.equal(null);
  //  chai.expect(actualResult._class).to.be.equal('Response');
  //  chai.expect(actualResult.data).to.be.eql(rawData);
  //  chai.expect(actualResult.error).to.be.equal(rawError);
  //
  //});
  //
  //test(`Check _buildCacheKey() method returns ${method}:${action.type}:${action.source}#${payload}`, function() {
  //  let actualResult = request._buildCacheKey();
  //  let expectedResult = `${method}:${action.type}:${action.source.original}#${JSON.stringify(payload)}`;
  //  chai.expect(actualResult).to.be.equal(expectedResult);
  //});
  //
  //test('Check cacheImpl() setter sets valid value', function() {
  //  let cache = new CacheMock();
  //  request.cacheImpl = cache;
  //  chai.expect(request.cacheImpl).to.be.equal(cache);
  //  chai.expect(request.cacheTtl).to.be.equal(Request.TTL_DEFAULT);
  //});
  //
  //test('Check _chooseResponseImpl() return valid object', function() {
  //  let error = null;
  //  let actualResult = null;
  //  try {
  //    actualResult = Request._chooseResponseImpl('TestClass');
  //  } catch (e) {
  //    error = e;
  //  }
  //
  //  chai.expect(error).to.be.equal(null);
  //});
  //
  //test('Check _rebuildResponse() throws \'Exception\'', function() {
  //  let rawData = '{ "_class":"TestResponseMessage"}';
  //
  //  let error = null;
  //  let actualResult = null;
  //  try {
  //    actualResult = request._rebuildResponse(rawData);
  //  } catch (e) {
  //    error = e;
  //  }
  //
  //  chai.assert.instanceOf(error, Exception, 'result is an instance of Exception');
  //  chai.expect(error.message).to.be.equal('Unknown Response implementation TestResponseMessage');
  //});
  //
  //test('Check _send() for lambda', function() {
  //  let error = null;
  //  try {
  //    request._send();
  //  } catch (e) {
  //    error = e;
  //  }
  //});
  //
  //test('Check _send() for external', function() {
  //  let externalAction = { type:'external', source: 'testLambda'};
  //  let externalPayload = '{"body":"bodyData"}';
  //  let externalMethod = 'method';
  //  let externalRequest = new Request(externalAction, externalPayload, externalMethod);
  //  let error = null;
  //  try {
  //    externalRequest._send();
  //  } catch (e) {
  //    error = e;
  //  }
  //});
  //
  //test('Check _send() throws \'Exception\'', function() {
  //  let invalidActionType = 'invalidAction';
  //  let invalidAction = new Action(resource, actionName, invalidActionType, methods, source, region);
  //  let payload = '{"body":"bodyData"}';
  //  let method = 'method';
  //  let invalidRequest = new Request(invalidAction, payload, method);
  //  let error = null;
  //  try {
  //    invalidRequest.useDirectCall();
  //    invalidRequest._send();
  //  } catch (e) {
  //    error = e;
  //  }
  //
  //  chai.assert.instanceOf(error, Exception, 'result is an instance of Exception');
  //  chai.expect(error.message).to.be.equal(`Request of type ${invalidActionType} is not implemented`);
  //});
  //
  //test('Check send() !isCached', function() {
  //  let error = null;
  //  request.disableCache();
  //  chai.expect(request.isCached).to.be.equal(false);
  //  try {
  //    request.send();
  //  } catch (e) {
  //    error = e;
  //  }
  //});
  //
  //test('Check send() isCached throws \'CachedRequestException\' exception in has() method', function() {
  //  let error = null;
  //  let spyCallback = sinon.spy();
  //  let cache = new CacheNegativeTest();
  //  request.cacheImpl = cache;
  //  request.enableCache();
  //  chai.expect(request.isCached).to.be.equal(true);
  //  try {
  //    request.send();
  //  } catch (e) {
  //    error = e;
  //  }
  //
  //  chai.expect(error).to.be.not.equal(null);
  //  chai.assert.instanceOf(error, CachedRequestException, 'error is an instance of CachedRequestException');
  //  chai.expect(spyCallback).to.not.have.been.calledWith();
  //});
  //
  //test('Check send() isCached throws \'CachedRequestException\' exception in get() method', function() {
  //  let error = null;
  //  let spyCallback = sinon.spy();
  //  let cache = new CacheNegativeInvalidateTest();
  //  request.cacheImpl = cache;
  //  request.enableCache();
  //  chai.expect(request.isCached).to.be.equal(true);
  //  try {
  //    request.send();
  //  } catch (e) {
  //    error = e;
  //  }
  //
  //  chai.expect(error).to.be.not.equal(null);
  //  chai.assert.instanceOf(error, CachedRequestException, 'error is an instance of CachedRequestException');
  //  chai.expect(spyCallback).to.not.have.been.calledWith();
  //});
  //
  //test('Check send() isCached', function() {
  //  let error = null;
  //  let spyCallback = sinon.spy();
  //  let cache = new CachePositiveTest();
  //  request.cacheImpl = cache;
  //  request.enableCache();
  //  chai.expect(request.isCached).to.be.equal(true);
  //  try {
  //    request.send();
  //  } catch (e) {
  //    error = e;
  //  }
  //
  //  chai.expect(error).to.be.equal(null);
  //  chai.expect(request._cacheTtl).to.be.not.equal(Request.TTL_INVALIDATE);
  //  chai.expect(spyCallback).to.not.have.been.calledWith('set called');
  //});
  //
  //test('Check send() isCached with calling _send()', function() {
  //  let error = null;
  //  let spyCallback = sinon.spy();
  //  let testRequest = new RequestMock(action, payload, method);
  //  let cache = new CachePositiveTest();
  //  testRequest.cacheImpl = cache;
  //  testRequest.enableCache();
  //  testRequest.useDirectCall();
  //  chai.expect(testRequest.isCached).to.be.equal(true);
  //
  //  try {
  //    testRequest.send();
  //  } catch (e) {
  //    error = e;
  //  }
  //
  //  chai.expect(error).to.be.equal(null);
  //  chai.expect(testRequest._cacheTtl).to.be.not.equal(Request.TTL_INVALIDATE);
  //  chai.expect(spyCallback).to.not.have.been.calledWith('called');
  //});
  //
  //test('Check _send() is called from send() method and throws exception', function() {
  //  let error = null;
  //  let spyCallback = sinon.spy();
  //  let testRequest = new RequestMock(action, payload, method);
  //  let cache = new CacheNoResultsTest();
  //  testRequest.cacheImpl = cache;
  //  testRequest.enableCache();
  //  testRequest.useDirectCall();
  //  chai.expect(testRequest.isCached).to.be.equal(true);
  //
  //  try {
  //    testRequest.send();
  //  } catch (e) {
  //    error = e;
  //  }
  //
  //  chai.expect(error).to.be.not.equal(null);
  //  chai.expect(testRequest._cacheTtl).to.be.not.equal(Request.TTL_INVALIDATE);
  //  chai.assert.instanceOf(error, CachedRequestException, 'error is an instance of CachedRequestException');
  //  chai.expect(spyCallback).to.not.have.been.calledWith();
  //});
  //
  //test('Check useDirectCall() method sets native=true', function() {
  //  chai.expect(request.useDirectCall().native).to.be.equal(true);
  //});
  //
  //test('Check invalidateCache() !isCached', function() {
  //  let error = null;
  //  let spyCallback = sinon.spy();
  //  request.disableCache();
  //  chai.expect(request.isCached).to.be.equal(false);
  //  try {
  //    request.invalidateCache(spyCallback);
  //    chai.expect(spyCallback).to.have.been.calledWith(true);
  //  } catch (e) {
  //    error = e;
  //  }
  //});
  //
  //test('Check invalidateCache() throws \'CachedRequestException\' exception in has() method', function() {
  //  let error = null;
  //  let spyCallback = sinon.spy();
  //  let cache = new CacheNegativeHasTest();
  //  request.cacheImpl = cache;
  //  request.enableCache();
  //  chai.expect(request.isCached).to.be.equal(true);
  //  try {
  //    request.invalidateCache(spyCallback);
  //  } catch (e) {
  //    error = e;
  //  }
  //
  //  chai.expect(error).to.be.not.equal(null);
  //  chai.assert.instanceOf(error, CachedRequestException, 'error is an instance of CachedRequestException');
  //});
  //
  //test('Check invalidateCache() throws \'CachedRequestException\' exception in invalidate() method', function() {
  //  let error = null;
  //  let spyCallback = sinon.spy();
  //  let cache = new CacheNegativeInvalidateTest();
  //  request.cacheImpl = cache;
  //  request.enableCache();
  //  chai.expect(request.isCached).to.be.equal(true);
  //  try {
  //    request.invalidateCache(spyCallback);
  //  } catch (e) {
  //    error = e;
  //  }
  //
  //  chai.expect(error).to.be.not.equal(null);
  //  chai.assert.instanceOf(error, CachedRequestException, 'error is an instance of CachedRequestException');
  //});
  //
  //test('Check invalidateCache() isCached', function() {
  //  let error = null;
  //  let spyCallback = sinon.spy();
  //  let cache = new CachePositiveTest();
  //  request.cacheImpl = cache;
  //  request.enableCache();
  //  chai.expect(request.isCached).to.be.equal(true);
  //  try {
  //    request.invalidateCache(spyCallback);
  //    chai.expect(spyCallback).to.have.been.calledWith('called invalidate');
  //  } catch (e) {
  //    error = e;
  //  }
  //
  //  chai.expect(error).to.be.equal(null);
  //});
  //
  //test('Check invalidateCache() isCached with no results in validate and has methods', function() {
  //  let error = null;
  //  let spyCallback = sinon.spy();
  //  let cache = new CacheNoResultsTest();
  //  request.cacheImpl = cache;
  //  request.enableCache();
  //  chai.expect(request.isCached).to.be.equal(true);
  //  try {
  //    request.invalidateCache(spyCallback);
  //    chai.expect(spyCallback).to.have.been.calledWith(true);
  //  } catch (e) {
  //    error = e;
  //  }
  //
  //  chai.expect(error).to.be.equal(null);
  //});
  //
  //test('Check _send() calls _sendThroughApi() method', function() {
  //  let error = null;
  //  let spyCallback = sinon.spy();
  //
  //  let actionName = 'UpdateTest';
  //  let cache = new CacheMock();
  //  let resource = {name: 'resourceTest', cache: cache};
  //  let type = 'lambda';
  //  let methods = ['GET', 'POST'];
  //  let source = {
  //    api: 'http://tets:8888/foo/bar?user=tj&pet=new',
  //  };
  //  let region = 'us-west-2';
  //  let action = new Action(resource, actionName, type, methods, source, region);
  //  let testRequest = new RequestMock(action, payload, method);
  //  testRequest.cacheImpl = cache;
  //  testRequest.enableCache();
  //  testRequest._native = false;
  //  chai.expect(testRequest.isCached).to.be.equal(true);
  //
  //  try {
  //    testRequest._send(spyCallback);
  //  } catch (e) {
  //    error = e;
  //  }
  //
  //  //@todo - need to add smart checks
  //  chai.expect(error).to.be.not.equal(null);
  //});
});
