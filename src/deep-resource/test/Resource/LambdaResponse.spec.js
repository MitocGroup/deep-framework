'use strict';

import chai from 'chai';
import {LambdaResponse} from '../../lib/Resource/LambdaResponse';
import {Resource} from '../../lib/Resource';
import {Action} from '../../lib/Resource/Action';
import {Request} from '../../lib/Resource/Request';
import {ValidationError} from '../../lib/Resource/Exception/ValidationError';
import Kernel from 'deep-kernel';
import Cache from 'deep-cache';
import Security from 'deep-security';
import Validation from 'deep-validation';
import Log from 'deep-log';
import KernelFactory from '../common/KernelFactory';

suite('Resource/LambdaResponse', () => {
  let backendKernelInstance = null;
  let action = null;
  let request = null;
  let lambdaResponse = null;
  let microserviceIdentifier = 'deep-hello-world';
  let resourceName = 'say-hello';
  let actionName = 'create-msg';
  let payload = '{"body":"bodyData"}';
  let method = 'POST';
  let rawData = {Payload: '{"dataKey":"testValue"}', StatusCode: 201};

  test('Class LambdaResponse exists in Resource/LambdaResponse', () => {
    chai.expect(LambdaResponse).to.be.an('function');
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
      Log: Log,
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

  test('Check creating request > lambdaResponse from action instance', () => {
    request = new Request(action, payload, method);
    lambdaResponse = new LambdaResponse(request, rawData, JSON.stringify(rawData));
    chai.assert.instanceOf(
      lambdaResponse, LambdaResponse, 'lambdaResponse is an instance of LambdaResponse'
    );
  });

  test('Check constructor sets valid value for _actions=null', () => {
    chai.expect(lambdaResponse.actions).to.be.equal(undefined);
  });

  test('Check constructor sets valid value for _localBackend=false', () => {
    chai.expect(lambdaResponse.localBackend).to.be.equal(undefined);
  });

  test('Check constructor sets valid value for _cache=null', () => {
    chai.expect(lambdaResponse.cache).to.be.equal(undefined);
  });

  test('Check data getter returns valid object', () => {
    //check when this._rawData
    let expectedResult = JSON.parse(rawData.Payload);
    chai.expect(lambdaResponse.data).to.be.eql(expectedResult);
  });

  test(`Check statusCode getter returns:  ${rawData.StatusCode}`, () => {
    //check when this._rawData
    chai.expect(lambdaResponse.statusCode).to.be.equal(rawData.StatusCode);
  });

  test('Check _decodeRawErrorObject for "string" error', () => {
    let rawError = '{"code":"501","errorMessage":"Internal error"}';

    let actualResult = LambdaResponse._decodeRawErrorObject(rawError);

    chai.expect(actualResult).to.be.eql(JSON.parse(rawError));
  });

  test('Check _decodeRawErrorObject for "string" error with exception in parse', () => {
    let rawError = '{"code":"501","errorMessage":"Internal error}';

    let actualResult = LambdaResponse._decodeRawErrorObject(rawError);

    chai.expect(actualResult).to.be.an('object');
  });

  test('Check _decodeRawErrorObject for "object" error', () => {
    let rawError = {
      code: 501,
      errorMessage: 'Internal error'
    };

    let actualResult = LambdaResponse._decodeRawErrorObject(rawError);

    chai.expect(actualResult).to.eql(rawError);
  });

  test('Check isValidationError returns false', () => {
    chai.expect(LambdaResponse.isValidationError({})).to.equal(false);
  });

  test('Check isValidationError returns false when errorType', () => {
    let payload = {
      errorType: 'Runtime',
      errorMessage: 'Out of memory',
      validationErrors: 'validationErrors',
    };

    chai.expect(LambdaResponse.isValidationError(payload)).to.equal(false);
  });

  test('Check isValidationError returns true', () => {
    let payload = {
      errorType: 'ValidationError',
      errorMessage: 'Should be string',
      validationErrors: 'Incorrect schema',
    };

    chai.expect(LambdaResponse.isValidationError(payload)).to.equal(true);
  });

  test('Check getPayloadError returns instance of ValidationError', () => {
    let payload = {
      errorType: 'ValidationError',
      errorMessage: 'Should be string',
      validationErrors: 'validationErrors',
    };

    let actualResult = LambdaResponse.getPayloadError(payload);

    chai.expect(actualResult, 'is an instance of ValidationError').to.be.an.instanceOf(ValidationError);
  });

  test('Check getPayloadError returns instance of Error', () => {
    let payload = {
      errorType: 'Runtime',
      errorMessage: 'Out of memory',
      validationErrors: 'Incorrect schema',
    };

    let actualResult = LambdaResponse.getPayloadError(payload);

    chai.expect(actualResult, 'is an instance of Error').to.be.an.instanceOf(Error);
  });

  test('Check getPayloadError returns null', () => {
    let actualResult = LambdaResponse.getPayloadError({});

    chai.expect(actualResult).to.be.equal(null);
  });

  test('Check getPayloadError returns null', () => {
    let actualResult = LambdaResponse.getPayloadError({});

    chai.expect(actualResult).to.be.equal(null);
  });

  test('Check _decodePayload returns decoded payload', () => {
    let actualResult = lambdaResponse._decodePayload();

    chai.expect(actualResult).to.be.eql(JSON.parse(rawData.Payload));
  });

  test('Check _decodePayload returns decoded payload for rawData.errorMessage', () => {

    let rawDataWithErrors = {
      Payload: '{"dataKey":"testValue","errorMessage":{"errorType":"Runtime","errorMessage":"Internal server error"}}',
      StatusCode: 500,
    };
    let expectedResult = {
      errorMessage: 'Internal server error',
      errorType: 'Runtime',
    };

    request = new Request(action, payload, method);
    lambdaResponse = new LambdaResponse(request, rawDataWithErrors, JSON.stringify(rawDataWithErrors));

    let actualResult = lambdaResponse._decodePayload();

    chai.expect(actualResult).to.be.eql(expectedResult);
  });

  test('Check _decodePayload returns decoded payload for !rawData.Payload', () => {

    let rawDataWithErrors = {
      StatusCode: 500,
      errorMessage: '{"errorType":"Runtime","errorMessage":"Internal server error"}',
    };
    let expectedResult = {
      errorMessage: 'Internal server error',
      errorType: 'Runtime',
    };

    request = new Request(action, payload, method);
    lambdaResponse = new LambdaResponse(request, rawDataWithErrors, JSON.stringify(rawDataWithErrors));

    let actualResult = lambdaResponse._decodePayload();

    chai.expect(actualResult).to.be.eql(expectedResult);
  });

  test('Check _fillStatusCode', () => {

    let rawDataWithErrors = {};

    request = new Request(action, payload, method);
    lambdaResponse = new LambdaResponse(request, rawDataWithErrors, JSON.stringify(rawDataWithErrors));

    lambdaResponse._fillStatusCode();
  });

});
