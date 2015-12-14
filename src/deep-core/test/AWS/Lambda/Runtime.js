'use strict';

import chai from 'chai';
import {Runtime} from '../../../lib/AWS/Lambda/Runtime';
import {Request} from '../../../lib/AWS/Lambda/Request';
import {Response} from '../../../lib/AWS/Lambda/Response';
import {ErrorResponse} from '../../../lib/AWS/Lambda/ErrorResponse';


class RuntimeTest extends Runtime {
  constructor(kernel) {
    super(kernel);
  }

  handle() {
    this._kernel = 'handled';
    return this;
  }
}

suite('AWS/Lambda/Runtime', function() {
  let kernel = {
    config: {
      forceUserIdentity: false,
    },
  };
  let event = {event: 'runLambda'};
  let context = {context: 'simpleContext'};
  let data = {data: 'responseData'};
  let runtimeTest = new RuntimeTest(kernel);

  test('Class Runtime exists in AWS/Lambda/Runtime', function() {
    chai.expect(typeof Runtime).to.equal('function');
  });

  test('Check constructor sets _kernel', function() {
    chai.expect(runtimeTest.kernel).to.be.eql(kernel);
  });

  test('Check constructor sets _request=null', function() {
    chai.expect(runtimeTest.request).to.be.equal(null);
  });

  test('Check constructor sets context=null', function() {
    chai.expect(runtimeTest.context).to.be.equal(null);
  });

  test('Check run() method returns valid object', function() {
    let actualResult = runtimeTest.run(event, context);
    chai.expect(actualResult._context).to.be.eql(context);
    chai.expect(actualResult.kernel).to.be.eql('handled');
    chai.expect(actualResult.request).to.be.an.instanceof(Request);
  });

  test('Check createResponse() method returns valid object', function() {
    let actualResult = runtimeTest.createResponse(data);
    chai.expect(actualResult).to.be.an.instanceof(Response);
    chai.expect(actualResult.rawData).to.be.eql(data);
    chai.expect(actualResult.runtime.context).to.be.eql(context);
  });

  test('Check createError() method returns valid object for string error', function() {
    let errorString = 'Error was throw: stacktrace stacktrace';
    let actualResult = runtimeTest.createError(errorString);
    chai.expect(actualResult).to.be.an.instanceof(ErrorResponse);
    chai.expect(actualResult.rawData.errorType).to.be.equal('Error');
    chai.expect(actualResult.rawData.errorMessage).to.be.equal(errorString);
    chai.expect(actualResult.runtime.context).to.be.eql(context);
  });

  test('Check createError() method returns valid object for string error', function() {
    let error = {
      message: 'Error was throw: stacktrace stacktrace',
      name: 'RuntimeException',
    };
    let actualResult = runtimeTest.createError(error);
    chai.expect(actualResult).to.be.an.instanceof(ErrorResponse);
    chai.expect(actualResult.rawData.errorType).to.be.equal(error.name);
    chai.expect(actualResult.rawData.errorMessage).to.be.equal(error.message);
    chai.expect(actualResult.runtime.context).to.be.eql(context);
  });

  test('Check lambda() method returns valid object ', function() {
    let functionResult = runtimeTest.lambda;
    chai.expect(typeof functionResult).to.be.equal('function');
    let actualResult = functionResult(event, context);
  });
});
