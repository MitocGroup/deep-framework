'use strict';

import chai from 'chai';
import {Action} from '../../lib.compiled/Resource/Action';
import {Resource} from '../../lib.compiled/Resource';
import {UnknownMethodException} from '../../lib.compiled/Resource/Exception/UnknownMethodException';
import backendConfig from '../common/backend-cfg-json';

suite('Resource/Action', function() {
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
        'delete': {
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
  let actionName = 'UpdateTest';
  let resource = new Resource(testResources);
  let type = 'typeTest';
  let methods = ['GET', 'POST'];
  let source = 'sourceTest';
  let region = 'us-west-2';
  let action = new Action(resource, actionName, type, methods, source, region, true);

  test('Class Action exists in Resource/Action', function() {
    chai.expect(typeof Action).to.equal('function');
  });

  test('Check constructor sets _resource', function() {
    chai.expect(action.resource).to.be.equal(resource);
  });

  test('Check constructor sets _name', function() {
    chai.expect(action.name).to.be.equal(actionName);
  });

  test('Check constructor sets _type', function() {
    chai.expect(action.type).to.be.equal(type);
  });

  test('Check constructor sets _methods', function() {
    chai.expect(action.methods).to.be.eql(methods);
  });

  test('Check constructor sets _source', function() {
    chai.expect(action.source).to.be.eql(source);
  });

  test('Check constructor sets _region', function() {
    chai.expect(action.region).to.be.eql(region);
  });

  test('Check LAMBDA static getter return \'lambda\'', function() {
    chai.expect(Action.LAMBDA).to.be.equal('lambda');
  });

  test('Check EXTERNAL static getter return \'external\'', function() {
    chai.expect(Action.EXTERNAL).to.be.equal('external');
  });

  test('Check HTTP_VERBS static getter', function() {
    chai.expect(Action.HTTP_VERBS.length).to.be.equal(7);
    chai.expect(Action.HTTP_VERBS).to.be.contains('GET');
    chai.expect(Action.HTTP_VERBS).to.be.contains('POST');
    chai.expect(Action.HTTP_VERBS).to.be.contains('DELETE');
    chai.expect(Action.HTTP_VERBS).to.be.contains('HEAD');
    chai.expect(Action.HTTP_VERBS).to.be.contains('PUT');
    chai.expect(Action.HTTP_VERBS).to.be.contains('OPTIONS');
    chai.expect(Action.HTTP_VERBS).to.be.contains('PATCH');
  });

  test('Check request method throws \'UnknownMethodException\' ' +
    'exception for unknow method', function() {
    let error = null;
    try {
      action.request({}, 'THROW');
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
    chai.expect(error).to.be.an.instanceof(UnknownMethodException);
  });

  test('Check request() method return valid object', function() {
    let error = null;
    let actualResult = null;
    let expectedResult = {
      _action: {
        _forceUserIdentity: true,
        _methods: [
          'GET',
          'POST',
        ],
        _name: 'UpdateTest',
        _region: 'us-west-2',
        _resource: {
          _container: null,
          _localBackend: false,
          _microservice: null,
          _resources: testResources,
        },
        _source: 'sourceTest',
        _type: 'typeTest',
      },
      _cacheImpl: null,
      _cacheTtl: 0,
      _cached: false,
      _native: false,
      _lambda: null,
      _method: 'GET',
      _payload: {},
    };

    try {
      actualResult = action.request({}, 'GET');
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
    chai.expect(actualResult).to.be.eql(expectedResult);
  });
});