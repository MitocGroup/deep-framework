'use strict';

import chai from 'chai';
import {Runtime} from '../../../lib/AWS/Lambda/Runtime';
import {RuntimeMock} from '../../Mocks/AWS/Lambda/RuntimeMock';
import {Request} from '../../../lib/AWS/Lambda/Request';
import {Context} from '../../../lib/AWS/Lambda/Context';
import {Response} from '../../../lib/AWS/Lambda/Response';
import {ErrorResponse} from '../../../lib/AWS/Lambda/ErrorResponse';

suite('AWS/Lambda/Runtime', () => {
  let kernel = {
    config: {
      forceUserIdentity: false,
    },
    get: () => {
      return this;
    },
  };
  let event = {event: 'runLambda'};
  let context = {context: 'simpleContext'};
  let data = {data: 'responseData'};
  let runtimeTest = new RuntimeMock(kernel);

  test('Class Runtime exists in AWS/Lambda/Runtime', () => {
    chai.expect(Runtime).to.be.an('function');
  });

  test('Check constructor sets _kernel', () => {
    chai.expect(runtimeTest.kernel).to.be.eql(kernel);
  });

  test('Check constructor sets _request=null', () => {
    chai.expect(runtimeTest.request).to.be.equal(null);
  });

  test('Check constructor sets context=null', () => {
    chai.expect(runtimeTest.context).to.be.equal(null);
  });

  test('Check constructor sets forceUserIdentity=false', () => {
    chai.expect(runtimeTest.forceUserIdentity).to.be.equal(false);
  });

  test('Check constructor sets loggedUserId=null', () => {
    chai.expect(runtimeTest.loggedUserId).to.be.equal(null);
  });

  test('Check run() method returns valid object', () => {
    let actualResult = runtimeTest.run(event, context);
    chai.expect(actualResult.context).to.be.an.instanceof(Context);
    chai.expect(actualResult.kernel).to.be.eql('handled');
    chai.expect(actualResult.request).to.be.an.instanceof(Request);
  });

  test('Check createResponse() method returns valid object', () => {
    let actualResult = runtimeTest.createResponse(data);
    chai.expect(actualResult).to.be.an.instanceof(Response);
    chai.expect(actualResult.rawData).to.be.eql(data);
    chai.expect(actualResult.runtime.context).to.be.an.instanceof(Context);
  });

  test('Check createError() method returns valid object for string error', () => {
    let errorString = 'Error was throw: stacktrace stacktrace';
    let actualResult = runtimeTest.createError(errorString);
    chai.expect(actualResult).to.be.an.instanceof(ErrorResponse);
  });

  test('Check lambda() method returns valid object ', () => {
    let functionResult = runtimeTest.lambda;
    chai.expect(typeof functionResult).to.be.equal('function');
    let actualResult = functionResult(event, context);
  });
});
