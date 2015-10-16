'use strict';

import chai from 'chai';
import {Action} from '../../lib.compiled/Resource/Action';
import {UnknownMethodException} from '../../lib.compiled/Resource/Exception/UnknownMethodException';
import Cache from 'deep-cache';

suite('Resource/Action', function() {
  let actionName = 'UpdateTest';
  let cache = new Cache();
  let resource = {name: 'resourceTest', cache: cache};
  let type = 'typeTest';
  let methods = ['GET', 'POST'];
  let source = 'sourceTest';
  let region = 'us-west-2';
  let action = new Action(resource, actionName, type, methods, source, region);

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
        _methods: [
          'GET',
          'POST',
        ],
        _name: 'UpdateTest',
        _region: 'us-west-2',
        _resource: {
          cache: {
            _container: null,
            _driver: null,
            _localBackend: false,
            _microservice: null,
          },
          name: 'resourceTest',
        },
        _source: 'sourceTest',
        _type: 'typeTest',
      },
      _cacheImpl: {
        _container: null,
        _driver: null,
        _localBackend: false,
        _microservice: null,
      },
      _cacheTtl: 10,
      _cached: true,
      _native: true,
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