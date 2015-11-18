'use strict';

import chai from 'chai';
import {LambdaResponse} from '../../lib.compiled/Resource/LambdaResponse';
import {Resource} from '../../lib.compiled/Resource';
import {Action} from '../../lib.compiled/Resource/Action';
import {Request} from '../../lib.compiled/Resource/Request';
import Kernel from 'deep-kernel';
import Cache from 'deep-cache';
import Security from 'deep-security';
import KernelFactory from '../common/KernelFactory';
import backendConfig from '../common/backend-cfg-json';

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
  let rawError = '{"message":"errorMessage", "name":"RuntimeException"}';

  test('Class LambdaResponse exists in Resource/LambdaResponse', function() {
    chai.expect(typeof LambdaResponse).to.equal('function');
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

      request = new Request(action, payload, method);
      lambdaResponse = new LambdaResponse(request, rawData, rawError);

      // complete the async
      done();

    };
    
    KernelFactory.create({
      Cache: Cache,
      Security: Security,
      Resource: Resource,
    }, callback);
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

    //check when this._data
    chai.expect(lambdaResponse.data).to.be.eql(expectedResult);
  });

  test(`Check statusCode getter returns:  ${rawData.StatusCode}`, function() {
    //check when this._rawData
    chai.expect(lambdaResponse.statusCode).to.be.equal(rawData.StatusCode);

    //check when this._statusCode
    chai.expect(lambdaResponse.statusCode).to.be.equal(rawData.StatusCode);
  });

  test('Check error getter returns valid error', function() {
    //check when this._rawError
    chai.expect(lambdaResponse.error).to.be.eql(rawError);

    //check when this._error
    chai.expect(lambdaResponse.error).to.be.eql(rawError);
  });

  test('Check error getter returns valid error from rawData with errorMessage', function() {
    let rawDataWithError = {Payload: '{"dataKey":"testValue","errorMessage":"Internal error"}', StatusCode: 500};
    let emptyRawError = null;
    let lambdaResponseWithError = new LambdaResponse(request, rawDataWithError, emptyRawError);
    chai.expect(lambdaResponseWithError.error).to.be.equal('Internal error');
  });

  test('Check errorType getter returns valid error', function() {
    //check when this._rawError
    chai.expect(lambdaResponse._rawError).to.be.equal(rawError);

    //check when this._errorType
    chai.expect(lambdaResponse.errorType).to.be.equal('Error');
  });

  test(
    'Check errorType getter returns valid error from rawData with errorType',
    function() {
      let rawDataWithError = {
        Payload: '{"dataKey":"testValue","errorMessage":"Internal error",' +
        '"errorType":"RuntimeException"}',
        StatusCode: 500,
      };
      let emptyRawError = null;
      let lambdaResponseWithError = new LambdaResponse(
        request, rawDataWithError, emptyRawError
      );
      chai.expect(lambdaResponseWithError.errorType).to.be.equal(
        'RuntimeException'
      );
    }
  );

  test('Check errorType getter returns valid error from rawData without errorType', function() {
    let rawDataWithError = {
      Payload: '{"dataKey":"testValue","errorMessage":"Internal error"}',
      StatusCode: 500,
    };
    let emptyRawError = null;
    let lambdaResponseWithError = new LambdaResponse(request, rawDataWithError, emptyRawError);
    chai.expect(lambdaResponseWithError.errorType).to.be.equal('Error');
  });
});
