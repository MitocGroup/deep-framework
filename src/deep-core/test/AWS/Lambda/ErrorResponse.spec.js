'use strict';

import chai from 'chai';
import {ErrorResponse} from '../../../lib/AWS/Lambda/ErrorResponse';
import {MissingRuntimeContextException} from '../../../lib/AWS/Lambda/Exception/MissingRuntimeContextException';
import {RuntimeMock} from '../../Mocks/AWS/Lambda/RuntimeMock';
import Kernel from 'deep-kernel';
import Validation from 'deep-validation';
import KernelFactory from './../../common/KernelFactory';

suite('AWS/Lambda/ErrorResponse', () => {
  let runtime = null;
  let backendKernelInstance = null;
  let error = Error('test error');
  let errorResponse = null;

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
    }, callback);
  });

  test('Check constructor sets _kernel', () => {
    runtime = new RuntimeMock(backendKernelInstance);
    chai.expect(runtime.kernel).to.be.eql(backendKernelInstance);
  });

  test('Class ErrorResponse exists in AWS/Lambda/ErrorResponse', () => {
    chai.expect(ErrorResponse).to.be.an('function');
  });

  test('Check contextMethod getter returns "fail"', () => {
    chai.expect(ErrorResponse.contextMethod).to.be.equal('fail');
  });

  test('Check data getter', () => {
    errorResponse = new ErrorResponse(runtime, error);

    chai.expect(errorResponse.data).to.be.equal(JSON.stringify(errorResponse._data));
  });

  test('Check createErrorObject()', () => {
    let error = {
      name: 'ValidationError',
      code: 400,
      annotate: () => {
        return 'error message here';
      },
      stack: 'errorStack here',
      details: 'error details',
    };
    let expextedResult = {
      errorType: error.name,
      errorMessage: error.annotate(),
      errorStack: error.stack,
      validationErrors: error.details,
      _deep_error_code_: error.code
    };

    let actualResult = ErrorResponse.createErrorObject(error);

    chai.expect(actualResult).to.be.an('object');
    chai.expect(actualResult).to.be.eql(expextedResult);
  });
});