'use strict';

import chai from 'chai';
import {LambdaResponse} from '../../lib/Resource/LambdaResponse';
import {Resource} from '../../lib/Resource';
import {Action} from '../../lib/Resource/Action';
import {Request} from '../../lib/Resource/Request';
import Kernel from 'deep-kernel';
import Cache from 'deep-cache';
import Security from 'deep-security';
import Validation from 'deep-validation';
import KernelFactory from '../common/KernelFactory';

suite('Resource/LambdaResponse', function() {
  let backendKernelInstance = null;
  let action = null;
  let request = null;
  let lambdaResponse = null;
  let microserviceIdentifier = 'hello.world.example';
  let resourceName = 'sample';
  let actionName = 'say-hello';
  let payload = '{"body":"bodyData"}';
  let method = 'POST';
  let rawData = {Payload: '{"dataKey":"testValue"}', StatusCode: 201};

  test('Class LambdaResponse exists in Resource/LambdaResponse', function() {
    chai.expect(typeof LambdaResponse).to.equal('function');
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
      Validation: Validation,
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

  test('Check creating request > lambdaResponse from action instance', function() {
    request = new Request(action, payload, method);
    lambdaResponse = new LambdaResponse(request, rawData, JSON.stringify(rawData));
    chai.assert.instanceOf(
      lambdaResponse, LambdaResponse, 'lambdaResponse is an instance of LambdaResponse'
    );
  });

  test('Check constructor sets valid value for _actions=null', function() {
    chai.expect(lambdaResponse.actions).to.be.equal(undefined);
  });

  test('Check constructor sets valid value for _localBackend=false', function() {
    chai.expect(lambdaResponse.localBackend).to.be.equal(undefined);
  });

  test('Check constructor sets valid value for _cache=null', function() {
    chai.expect(lambdaResponse.cache).to.be.equal(undefined);
  });

  test('Check data getter returns valid object', function() {
    //check when this._rawData
    let expectedResult = JSON.parse(rawData.Payload);
    chai.expect(lambdaResponse.data).to.be.eql(expectedResult);
  });

  test(`Check statusCode getter returns:  ${rawData.StatusCode}`, function() {
    //check when this._rawData
    chai.expect(lambdaResponse.statusCode).to.be.equal(rawData.StatusCode);
  });
});
