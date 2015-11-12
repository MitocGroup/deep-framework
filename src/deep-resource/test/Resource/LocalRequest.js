'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {LocalRequest} from '../../lib.compiled/Resource/LocalRequest';
import {SuperagentResponse} from '../../lib.compiled/Resource/SuperagentResponse';
import {Response} from '../../lib.compiled/Resource/Response';
import {Action} from '../../lib.compiled/Resource/Action';
import {Resource} from '../../lib.compiled/Resource';
import CacheMock from '../Mock/CacheMock';
import Kernel from 'deep-kernel';
import Cache from 'deep-cache';
import Security from 'deep-security';
import KernelFactory from '../common/KernelFactory';
import backendConfig from '../common/backend-cfg-json';
import RequireProxy from 'proxyquire';
import Http from 'superagent';
import {HttpMock} from '../Mock/HttpMock';

chai.use(sinonChai);

suite('Resource/LocalRequest', function() {
  let backendKernelInstance = null;
  let action = null;
  let localRequest = null;
  let microserviceIdentifier = 'hello.world.example';
  let resourceName = 'sample';
  let actionName = 'say-hello';
  let payload = '{"body":"bodyData"}';
  let method = 'POST';
  let httpMock = new HttpMock();

  test('Class LocalRequest exists in Resource/LocalRequest', function() {
    chai.expect(typeof LocalRequest).to.equal('function');
  });

  test('Load Kernel by using Kernel.load()', function(done) {
    let callback = (backendKernel) => {
      chai.assert.instanceOf(
        backendKernel, Kernel, 'backendKernel is an instance of Kernel');
      backendKernelInstance = backendKernel;
      action = backendKernel.get('resource').get(
        `@${microserviceIdentifier}:${resourceName}:${actionName}`
      );

      chai.assert.instanceOf(
        action, Action, 'action is an instance of Action'
      );


      Object.defineProperty(httpMock, '@global', {
        value: true,
        writable: false,
      });

      httpMock.fixBabelTranspile();

      let localRequestExport = RequireProxy('../../lib.compiled/Resource/LocalRequest', {
        'superagent': httpMock,
      });

      let LocalRequest = localRequestExport.LocalRequest;

      localRequest = new LocalRequest(action, payload, method);

      // complete the async
      done();

    };

    KernelFactory.create({
      Cache: Cache,
      Security: Security,
      Resource: Resource,
    }, callback);
  });

  test('Check LOCAL_LAMBDA_ENDPOINT static getter return "/_/lambda"',
    function() {
      chai.expect(LocalRequest.LOCAL_LAMBDA_ENDPOINT).to.be.equal('/_/lambda');
    }
  );

  test('Check _send() method for acctionType="lambda"', function() {
    let spyCallback = sinon.spy();

    httpMock.disableFailureModeFor(['end']);

    localRequest._send(spyCallback);

    let actualResult = spyCallback.args[0][0];

    chai.expect(typeof actualResult).to.equal('object')
    chai.expect(actualResult.constructor.name).to.equal('SuperagentResponse');
  });

  //todo - need to fix when AWS mock will be created
  //test('Check _send() method for acctionType!=\'lambda\'', function() {
  //  let error = null;
  //  let spyCallback = sinon.spy();
  //  let cache = new CacheMock();
  //  let actionName = 'UpdateTest';
  //  let resource = {name: 'resourceTest', cache: cache};
  //  let type = 'testType';
  //  let methods = ['GET', 'POST'];
  //  let source = {
  //    api: 'http://tets:8888/foo/bar?user=tj&pet=new',
  //  };
  //  let region = 'us-west-2';
  //  let action = new Action(resource, actionName, type, methods, source, region);
  //  let testRequest = new LocalRequest(action, payload, method);
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
  //});
});
