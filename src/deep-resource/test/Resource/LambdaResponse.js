'use strict';

import chai from 'chai';
import {LambdaResponse} from '../../lib.compiled/Resource/LambdaResponse';
import {Resource} from '../../lib.compiled/Resource';
import {Action} from '../../lib.compiled/Resource/Action';
import {Request} from '../../lib.compiled/Resource/Request';

suite('Resource/LambdaResponse', function() {
  let testResources = {
    'deep.test': {
      test: {
        create: {
          description: 'Lambda for creating test',
          type: 'lambda',
          methods: [
            'POST',
          ],
          source: 'src/Test/Create',
        },
        retrieve: {
          description: 'Retrieves test',
          type: 'lambda',
          methods: ['GET'],
          source: 'src/Test/Retrieve',
        },
        delete: {
          description: 'Lambda for deleting test',
          type: 'lambda',
          methods: ['DELETE'],
          source: 'src/Test/Delete',
        },
        update: {
          description: 'Update test',
          type: 'lambda',
          methods: ['PUT'],
          source: 'src/Test/Update',
        },
      },
    },
  };
  let resource = new Resource(testResources);
  let actionName = 'UpdateTest';
  let type = 'lambda';
  let methods = ['GET', 'POST'];
  let source = 'sourceTest';
  let region = 'us-west-2';
  let action = new Action(resource, actionName, type, methods, source, region);
  let payload = '{"body":"bodyData"}';
  let method = 'method';
  let request = new Request(action, payload, method);
  let rawData = {Payload: '{"dataKey":"testValue"}', StatusCode:201};
  let rawError = '{"message":"errorMessage", "name":"RuntimeException"}';
  let lambdaResponse = new LambdaResponse(request, rawData, rawError);

  test('Class LambdaResponse exists in Resource/LambdaResponse', function() {
    chai.expect(typeof LambdaResponse).to.equal('function');
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
    chai.expect(lambdaResponse.errorType).to.be.equal('Error');

    //check when this._errorType
    chai.expect(lambdaResponse.errorType).to.be.equal('Error');
  });

  test('Check errorType getter returns valid error from rawData with errotType', function() {
    let rawDataWithError = {Payload: '{"dataKey":"testValue","errorMessage":"Internal error",' +
    '"errorType":"RuntimeException"}', StatusCode: 500};
    let emptyRawError = null;
    let lambdaResponseWithError = new LambdaResponse(request, rawDataWithError, emptyRawError);
    chai.expect(lambdaResponseWithError.errorType).to.be.equal('RuntimeException');
  });

  test('Check errorType getter returns valid error from rawData without errotType', function() {
    let rawDataWithError = {Payload: '{"dataKey":"testValue","errorMessage":"Internal error"}', StatusCode: 500};
    let emptyRawError = null;
    let lambdaResponseWithError = new LambdaResponse(request, rawDataWithError, emptyRawError);
    chai.expect(lambdaResponseWithError.errorType).to.be.equal('Error');
  });
});
