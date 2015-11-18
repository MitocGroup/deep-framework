'use strict';

import chai from 'chai';
import {Response} from '../../lib.compiled/Resource/Response';
import {Resource} from '../../lib.compiled/Resource';
import {Request} from '../../lib.compiled/Resource/Request';
import {Action} from '../../lib.compiled/Resource/Action';
import Kernel from 'deep-kernel';
import Cache from 'deep-cache';
import Security from 'deep-security';
import KernelFactory from '../common/KernelFactory';

suite('Resource/Response', function() {
  let backendKernelInstance = null;
  let action = null;
  let request = null;
  let response = null;
  let microserviceIdentifier = 'hello.world.example';
  let resourceName = 'sample';
  let actionName = 'say-hello';
  let payload = '{"body":"bodyData"}';
  let method = 'POST';
  let rawData = {Payload: '{"dataKey":"testValue"}', StatusCode: 201};
  let rawError = '{ "message":"errorMessage"}';

  test('Class Response exists in Resource/Response', function() {
    chai.expect(typeof Response).to.equal('function');
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

  test('Check creating request > response from action instance', function() {
    request = new Request(action, payload, method);
    response = new Response(request, rawData, rawError);

    chai.assert.instanceOf(
      response, Response, 'response is an instance of Response'
    );
  });

  test('Check constructor sets _request', function() {
    chai.expect(response.request).to.be.eql(request);
  });

  test('Check constructor sets _rawError', function() {
    chai.expect(response.rawError).to.be.equal(rawError);
  });

  test('Check constructor sets _rawData', function() {
    chai.expect(response.rawData).to.be.equal(rawData);
  });

  test(`Check statusCode getter returns \'${rawData.StatusCode}\' when this._rawData`,
    function() {
      //check when this._rawData
      chai.expect(response._rawData).to.be.equal(rawData);

      //check when this._statusCode
      chai.expect(response.statusCode).to.be.equal(rawData.StatusCode);
    }
  );

  test(`Check statusCode getter returns \'${rawData.StatusCode}\' when this._statusCode`,
    function() {
      chai.expect(response.statusCode).to.be.equal(rawData.StatusCode);
    }
  );

  test('Check data getter returns valid object', function() {
    //check when this._rawData
    let expectedResult = JSON.parse(rawData.Payload);
    chai.expect(response.data).to.be.eql(expectedResult);

    //check when this._data
    chai.expect(response.data).to.be.eql(expectedResult);
  });

  test('Check error getter returns valid error', function() {
    chai.expect(response.error).to.be.eql(rawError);
  });

  test('Check isError getter returns true', function() {
    chai.expect(response.isError).to.be.equal(true);
  });

  test(
    'Check error getter returns valid error from rawData',
    function() {
      let rawDataWithError = {
        Payload: '{"dataKey":"testValue","errorMessage":"Internal error"}',
        StatusCode: 500,
      };
      let emptyRawError = null;
      let responseWithError = new Response(
        request, rawDataWithError, emptyRawError
      );
      chai.expect(responseWithError.error).to.be.equal('Internal error');
    }
  );
});
