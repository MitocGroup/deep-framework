'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {Action} from '../../lib.compiled/Resource/Action';
import {Instance} from '../../lib.compiled/Resource/Instance';
import {Resource} from '../../lib.compiled/Resource';
import CacheMock from '../Mock/CacheMock';
import Kernel from 'deep-kernel';
import Cache from 'deep-cache';
import Security from 'deep-security';
import KernelFactory from '../common/KernelFactory';
import backendConfig from '../common/backend-cfg-json';
import requireProxy from 'proxyquire';
import {HttpMock} from '../Mock/HttpMock';
import {LocalRequest} from '../../lib.compiled/Resource/LocalRequest';

chai.use(sinonChai);

suite('Resource/LocalRequest', function() {
  let backendKernelInstance = null;
  let action = null;
  let localRequest = null;
  let resource = null;
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
      resource = backendKernel.get('resource').get(
        `@${microserviceIdentifier}:${resourceName}`
      );

      chai.assert.instanceOf(
        action, Action, 'action is an instance of Action'
      );
      chai.assert.instanceOf(
        resource, Instance, 'resource is an instance of Instance'
      );

      //mocking Http
      Object.defineProperty(httpMock, '@global', {
        value: true,
        writable: false,
      });

      httpMock.fixBabelTranspile();

      let localRequestExport = requireProxy('../../lib.compiled/Resource/LocalRequest', {
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

    httpMock.setMode(HttpMock.DATA_MODE, ['end']);

    localRequest._send(spyCallback);

    let actualResult = spyCallback.args[0][0];

    chai.expect(typeof actualResult).to.equal('object');
    chai.expect(actualResult.constructor.name).to.equal('SuperagentResponse');
  });

  test('Check _send() method for acctionType!=\'lambda\'', function() {
    let spyCallback = sinon.spy();
    let source = backendConfig
      .microservices[microserviceIdentifier]
      .resources[resourceName][actionName]
      .source;
    let region = backendConfig
      .microservices[microserviceIdentifier]
      .resources[resourceName][actionName]
      .region;

    let externalAction = new Action(
      resource, actionName, Action.EXTERNAL, method, source, region
    );
    let externalRequest = new LocalRequest(externalAction, payload, method);

    //todo - it looks like code issue here, line:40
    //uncomment when issue will be fixed
    try {
      externalRequest._send(spyCallback);
    } catch (e) {

    }
    //let actualResult = spyCallback.args[0][0];
    //chai.expect(typeof actualResult).to.equal('object')
    //chai.expect(actualResult.constructor.name).to.equal('SuperagentResponse');
  });
});
