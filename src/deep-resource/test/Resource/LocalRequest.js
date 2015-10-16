'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {LocalRequest} from '../../lib.compiled/Resource/LocalRequest';
import {Action} from '../../lib.compiled/Resource/Action';
import {Resource} from '../../lib.compiled/Resource';
import CacheMock from '../Mock/CacheMock';

chai.use(sinonChai);

suite('Resource/LocalRequest', function() {
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

  test('Class LocalRequest exists in Resource/LocalRequest', function() {
    chai.expect(typeof LocalRequest).to.equal('function');
  });

  test('Check LOCAL_LAMBDA_ENDPOINT static getter return \'/_/lambda\'', function() {
    chai.expect(LocalRequest.LOCAL_LAMBDA_ENDPOINT).to.be.equal('/_/lambda');
  });

  test('Check _send() method for acctionType=\'lambda\'', function() {
    let error = null;
    let spyCallback = sinon.spy();
    let actionName = 'UpdateTest';
    let cache = new CacheMock();
    let resource = {name: 'resourceTest', cache: cache};
    let type = 'lambda';
    let methods = ['GET', 'POST'];
    let source = {
      api: 'http://tets:8888/foo/bar?user=tj&pet=new',
    };
    let region = 'us-west-2';
    let action = new Action(resource, actionName, type, methods, source, region);
    let testRequest = new LocalRequest(action, payload, method);
    testRequest.cacheImpl = cache;
    testRequest.enableCache();
    testRequest._native = false;
    chai.expect(testRequest.isCached).to.be.equal(true);

    try {
      testRequest._send(spyCallback);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
  });

  test('Check _send() method for acctionType!=\'lambda\'', function() {
    let error = null;
    let spyCallback = sinon.spy();
    let cache = new CacheMock();
    let actionName = 'UpdateTest';
    let resource = {name: 'resourceTest', cache: cache};
    let type = 'testType';
    let methods = ['GET', 'POST'];
    let source = {
      api: 'http://tets:8888/foo/bar?user=tj&pet=new',
    };
    let region = 'us-west-2';
    let action = new Action(resource, actionName, type, methods, source, region);
    let testRequest = new LocalRequest(action, payload, method);
    testRequest.cacheImpl = cache;
    testRequest.enableCache();
    testRequest._native = false;
    chai.expect(testRequest.isCached).to.be.equal(true);

    try {
      testRequest._send(spyCallback);
    } catch (e) {
      error = e;
    }
  });
});
