'use strict';

import chai from 'chai';
import {Response} from '../../lib.compiled/Resource/Response';
import {Resource} from '../../lib.compiled/Resource';
import {Request} from '../../lib.compiled/Resource/Request';
import {Action} from '../../lib.compiled/Resource/Action';

suite('Resource/Response', function() {
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
  let rawError = '{ "message":"errorMessage"}';
  let response = new Response(request, rawData, rawError);

  test('Class Response exists in Resource/Response', function() {
    chai.expect(typeof Response).to.equal('function');
  });

  test('Check constructor sets _request', function() {
    chai.expect(response.request).to.be.equal(request);
  });

  test('Check constructor sets _rawError', function() {
    chai.expect(response.rawError).to.be.equal(rawError);
  });

  test('Check constructor sets _rawData', function() {
    chai.expect(response.rawData).to.be.equal(rawData);
  });

  test(`Check statusCode getter returns:  ${rawData.StatusCode}`, function() {
    //check when this._rawData
    chai.expect(response.statusCode).to.be.equal(rawData.StatusCode);

    //check when this._statusCode
    chai.expect(response.statusCode).to.be.equal(rawData.StatusCode);
  });

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

  test('Check error getter returns valid error from rawData', function() {
    let rawDataWithError = {Payload: '{"dataKey":"testValue","errorMessage":"Internal error"}', StatusCode:500};
    let emptyRawError = null;
    let responseWithError = new Response(request, rawDataWithError, emptyRawError);
    chai.expect(responseWithError.error).to.be.equal('Internal error');
  });
});
