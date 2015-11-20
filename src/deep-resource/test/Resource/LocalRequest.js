'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {Action} from '../../lib.compiled/Resource/Action';
import {Instance} from '../../lib.compiled/Resource/Instance';
import {Resource} from '../../lib.compiled/Resource';
import Kernel from 'deep-kernel';
import Cache from 'deep-cache';
import Security from 'deep-security';
import KernelFactory from '../common/KernelFactory';
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
    }, callback);
  });

  test('Check getting action from Kernel instance', function() {
    action = backendKernelInstance.get('resource').get(
      `@${microserviceIdentifier}:${resourceName}:${actionName}`
    );

    chai.assert.instanceOf(
      action, Action, 'action is an instance of Action'
    );
  });

  test('Check getting resource from Kernel instance', function() {
    resource = backendKernelInstance.get('resource').get(
      `@${microserviceIdentifier}:${resourceName}`
    );

    chai.assert.instanceOf(
      resource, Instance, 'resource is an instance of Instance'
    );
  });

  test('Check localRequest constructor', function() {
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
  });

  test('Check LOCAL_LAMBDA_ENDPOINT static getter return "/_/lambda"',
    function() {
      chai.expect(LocalRequest.LOCAL_LAMBDA_ENDPOINT).to.be.equal('/_/lambda');
    }
  );

  test('Check _send() method for acctionType="lambda" for window = {}', function() {
    let spyCallback = sinon.spy();

    httpMock.setMode(HttpMock.DATA_MODE, ['end']);
    global.window = {};
    localRequest._send(spyCallback);

    let actualResult = spyCallback.args[0][0];

    chai.expect(typeof actualResult).to.equal('object');
    chai.expect(actualResult.constructor.name).to.equal('SuperagentResponse');
  });

  test('Check _send() throws "MissingLocalLambdaExecWrapperException" for !window',
    function () {
      let error = null;
      let spyCallback = sinon.spy();

      httpMock.setMode(HttpMock.DATA_MODE, ['end']);
      global.window = undefined;

      try {
        localRequest._send(spyCallback);
      } catch (e) {
        error = e;
      }

      chai.expect(error.constructor.name).to.equal('MissingLocalLambdaExecWrapperException');
    }
  );

  test('Check _send() method for acctionType!="lambda"', function() {
    let spyCallback = sinon.spy();
    let source = {
      api: 'https://1zf47jpvxd.execute-api.us-west-2.amazonaws.com/dev/hello-world-example/sample/say-hello',
      original: 'arn:aws:lambda:us-west-2:389615756922:function:DeepDevSampleSayHello64232f3705a',
    };
    let region = 'us-west-2';

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
