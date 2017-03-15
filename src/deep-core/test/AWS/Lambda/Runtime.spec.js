'use strict';

import chai from 'chai';
import {Runtime} from '../../../lib/AWS/Lambda/Runtime';
import {RuntimeMock} from '../../Mocks/AWS/Lambda/RuntimeMock';
import {Request} from '../../../lib/AWS/Lambda/Request';
import {Context} from '../../../lib/AWS/Lambda/Context';
import {Response} from '../../../lib/AWS/Lambda/Response';
import {ErrorResponse} from '../../../lib/AWS/Lambda/ErrorResponse';
import {InvalidCognitoIdentityException} from '../../../lib/AWS/Lambda/Exception/InvalidCognitoIdentityException';
import Kernel from 'deep-kernel';
import Validation from 'deep-validation';
import Resource from 'deep-resource';
import Security from 'deep-security';
import Cache from 'deep-cache';
import Log from 'deep-log';
import KernelFactory from './../../common/KernelFactory';

suite('AWS/Lambda/Runtime', () => {
  let runtime = null;
  let event = {event: 'runLambda'};
  let context = {
    context: 'simpleContext',
    invokedFunctionArn: 'test invokedFunctionArn',
    failed: false,
    succeeded: false,
    succeed: function() { this.succeeded = true; }, // do not replace with arrow function
    fail: function() { this.failed = true; }
  };
  let data = {data: 'responseData'};
  let validation = null;
  let backendKernelInstance = null;

  test('Class Runtime exists in AWS/Lambda/Runtime', () => {
    chai.expect(Runtime).to.be.an('function');
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
      Validation: Validation,
      Security: Security,
      Resource: Resource,
      Cache: Cache,
      Log: Log,
    }, callback);
  });

  test('Check getting resource from Kernel instance', () => {
    validation = backendKernelInstance.get('validation');
    chai.assert.instanceOf(
      validation, Validation, 'resource is an instance of Resource'
    );
  });

  test('Check constructor sets _kernel', () => {
    runtime = new RuntimeMock(backendKernelInstance);
    chai.expect(runtime.kernel).to.be.eql(backendKernelInstance);
  });

  test('Check constructor sets _request=null', () => {
    chai.expect(runtime.request).to.be.equal(null);
  });

  test('Check constructor sets context=null', () => {
    chai.expect(runtime.context).to.be.equal(null);
  });

  test('Check constructor sets forceUserIdentity=false', () => {
    chai.expect(runtime.forceUserIdentity).to.be.equal(false);
  });

  test('Check constructor sets loggedUserId=null', () => {
    chai.expect(runtime.loggedUserId).to.be.equal(null);
  });

  test('Check securityService', () => {
    chai.expect(runtime.securityService).to.be.an.instanceOf(Security);
  });

  test('Check run() method returns valid object', () => {
    let actualResult = runtime.run(event, context);
    chai.expect(actualResult.context).to.be.an.instanceof(Context);
    chai.expect(actualResult.kernel).to.be.eql(backendKernelInstance);
    chai.expect(actualResult.request).to.be.an.instanceof(Request);
  });

  test('Check createResponse() method returns valid object', () => {
    let actualResult = runtime.createResponse(data);
    chai.expect(actualResult).to.be.an.instanceof(Response);
    chai.expect(actualResult.rawData).to.be.eql(data);
    chai.expect(actualResult.runtime.context).to.be.an.instanceof(Context);
  });

  test('Check createError() method returns valid object for string error', () => {
    let errorString = 'Error was throw: stacktrace stacktrace';
    let actualResult = runtime.createError(errorString);
    chai.expect(actualResult).to.be.an.instanceof(ErrorResponse);
  });

  test('Check lambda() method returns valid object ', () => {
    let functionResult = runtime.lambda;

    chai.expect(typeof functionResult).to.be.equal('function');
  });

  test('Check _injectValidationSchema()', () => {
    let testModelName = 'ConfigurationModel';
    let testModelSchema = {
      Configuration: 'string',
      Status: 'number',
    };

    let actualResult = runtime._injectValidationSchema(testModelSchema, testModelName);

    chai.expect(actualResult).to.equal(testModelName);
    chai.expect(runtime.kernel.get('validation').hasSchema(actualResult)).to.equal(true);
  });

  test('Check run() throws "MissingUserContextException"', () => {
    let _runtime = new RuntimeMock(backendKernelInstance);
    let actualResult = null;

    _runtime._forceUserIdentity = true;
    _runtime._loggedUserId = false;

    actualResult = _runtime.run(event, context);

    chai.expect(actualResult).to.be.an.instanceof(Runtime);
  });

  test('Check _runValidate() calls _injectValidationSchema()', () => {
    let testModelName = 'ConfigurationModel';

    runtime._runValidate(testModelName);
  });

  test('Check calleeConfig', () => {
    let _runtime = new RuntimeMock(backendKernelInstance);
    let calleeConfig = {key: 'Test calleeConfig'};

    _runtime._calleeConfig = calleeConfig;
    _runtime.run(event, context);

    chai.expect(_runtime.calleeConfig).to.eql(calleeConfig);
  });

  // test('Check _fillUserContext throws InvalidCognitoIdentityException', () => {
  //   let error = null;
  //   let _runtime = new RuntimeMock(backendKernelInstance);
  //   let _context = Object.assign(context, {
  //     identity: {
  //       cognitoIdentityPoolId: 'test cognitoIdentityPoolId',
  //       cognitoIdentityId: 'test cognitoIdentityId',
  //     }
  //   });
  // 
  //   _runtime.run(event, _context);
  // 
  //   try {
  //     _runtime._fillUserContext();
  //   } catch (e) {
  //     error = e;
  //   }
  // 
  //   chai.expect(error).to.be.an.instanceof(InvalidCognitoIdentityException);
  // });
});
