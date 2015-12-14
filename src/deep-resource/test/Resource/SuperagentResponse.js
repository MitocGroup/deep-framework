'use strict';

import chai from 'chai';
import {SuperagentResponse} from '../../lib/Resource/SuperagentResponse';
import {Resource} from '../../lib/Resource';
import {Request} from '../../lib/Resource/Request';
import {Action} from '../../lib/Resource/Action';
import Kernel from 'deep-kernel';
import Cache from 'deep-cache';
import Security from 'deep-security';
import KernelFactory from '../common/KernelFactory';

suite('Resource/SuperagentResponse', function() {
  let backendKernelInstance = null;
  let action = null;
  let request = null;
  let superagentResponse = null;
  let microserviceIdentifier = 'hello.world.example';
  let resourceName = 'sample';
  let actionName = 'say-hello';
  let payload = '{"body":"bodyData"}';
  let method = 'POST';
  let rawData = {status: 500, body: 'bodyTest', error: 'errorMessage',};
  let rawError = {message: 'errorMessage'};

  test('Class SuperagentResponse exists in Resource/SuperagentResponse',
    function() {
      chai.expect(typeof SuperagentResponse).to.equal('function');
    }
  );

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

  test('Check creating request > superagentResponse from action instance', function() {
    request = new Request(action, payload, method);
    superagentResponse = new SuperagentResponse(request, rawData, rawError);

    chai.assert.instanceOf(
      superagentResponse,
      SuperagentResponse,
      'superagentResponse is an instance of SuperagentResponse'
    );
  });

  test('Check isError getter returns true', function() {
    chai.expect(superagentResponse.isError).to.be.equal(true);
  });

  test(`Check statusCode getter returns ${rawData.status}`, function() {
    chai.expect(superagentResponse.statusCode).to.be.equal(rawData.status);
  });

  test('Check constructor for !data.body && status < 300', function() {
    rawData = {Payload: '{"dataKey":"testValue"}', status: 201};
    rawError = null;

    superagentResponse = new SuperagentResponse(request, rawData, rawError);

    chai.expect(superagentResponse.isError).to.be.equal(false);
    chai.expect(superagentResponse.statusCode).to.be.equal(rawData.status);
  });
});
