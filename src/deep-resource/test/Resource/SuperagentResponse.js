'use strict';

import chai from 'chai';
import {SuperagentResponse} from '../../lib.compiled/Resource/SuperagentResponse';
import {Resource} from '../../lib.compiled/Resource';
import {Request} from '../../lib.compiled/Resource/Request';
import {Action} from '../../lib.compiled/Resource/Action';

suite('Resource/SuperagentResponse', function () {
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
  let rawData = {status: 500, body: 'bodyTest', error: 'errorMessage',};
  let rawError = {message: 'errorMessage'};

  let superagentResponse = new SuperagentResponse(request, rawData, rawError);

  test('Class SuperagentResponse exists in Resource/SuperagentResponse', function() {
    chai.expect(typeof SuperagentResponse).to.equal('function');
  });

  test('Check constructor sets _data', function() {
    chai.expect(superagentResponse.data).to.be.equal(null);
  });

  test('Check constructor sets _error', function() {
    chai.expect(superagentResponse.error).to.be.eql(rawError);
  });

  test('Check isError getter returns true', function() {
    chai.expect(superagentResponse.isError).to.be.equal(true);
  });

  test(`Check statusCode getter returns ${rawData.status}`, function() {
    chai.expect(superagentResponse.statusCode).to.be.equal(rawData.status);
  });
});
