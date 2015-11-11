'use strict';

import chai from 'chai';
import {Action} from '../../lib.compiled/Resource/Action';
import {Request} from '../../lib.compiled/Resource/Request';
import {Resource} from '../../lib.compiled/Resource';
import {Instance as ResourceInstance} from '../../lib.compiled/Resource/Instance';
import {UnknownMethodException} from '../../lib.compiled/Resource/Exception/UnknownMethodException';
import Kernel from 'deep-kernel';
import Cache from 'deep-cache';
import Security from 'deep-security';
import KernelFactory from '../common/KernelFactory';
import backendConfig from '../common/backend-cfg-json';

suite('Resource/Action', function() {
  let actionName = 'say-hello';
  let resourceName = 'sample';
  let actionType = 'lambda';
  let actionMethods = ['POST'];
  let microserviceIdentifier = 'hello.world.example';
  let actionSource = backendConfig.microservices[microserviceIdentifier]
    .resources[resourceName][actionName].source;
  let actionRegion = 'us-west-2';
  let action = null;
  let backendKernelInstance = null;

  test('Class Action exists in Resource/Action', function() {
    chai.expect(typeof Action).to.equal('function');
  });

  test('Load Kernel by using Kernel.load()', function(done) {
    let callback = (backendKernel) => {
      chai.assert.instanceOf(
        backendKernel, Kernel, 'backendKernel is an instance of Kernel');
      backendKernelInstance = backendKernel;
      action = backendKernel.get('resource')
        .get(`@${microserviceIdentifier}:${resourceName}:${actionName}`);

      chai.assert.instanceOf(
        action, Action, 'action is an instance of Action'
      );

      // complete the async
      done();
    };
    KernelFactory.create({
      Cache: Cache,
      Security: Security,
      Resource: Resource,
    }, callback);
  });

  test('Check resource getter returns valid instance of Resource', function() {
    chai.assert.instanceOf(
      action.resource, ResourceInstance,
      'action.resource is an instance of ResourceInstance');
    chai.expect(action.resource.name).to.be.equal(resourceName);
  });

  test(`Check name getter returns ${actionName}`, function() {
    chai.expect(action.name).to.be.equal(actionName);
  });

  test(`Check type getter returns ${actionType}`, function() {
    chai.expect(action.type).to.be.equal(actionType);
  });

  test(`Check methods getter returns ${actionMethods}`, function() {
    chai.expect(action.methods).to.be.eql(actionMethods);
  });

  test(`Check methods getter returns ${actionSource}`, function() {
    chai.expect(action.source).to.be.equal(actionSource);
  });

  test(`Check region getter returns ${actionRegion}`, function() {
    chai.expect(action.region).to.be.equal(actionRegion);
  });

  test('Check LAMBDA static getter return "lambda"', function() {
    chai.expect(Action.LAMBDA).to.be.equal('lambda');
  });

  test('Check EXTERNAL static getter return "external"', function() {
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

  test('Check request method throws "UnknownMethodException" ' +
    'exception for unknow method', function() {
    let error = null;
    try {
      action.request({}, 'GET');
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
    chai.expect(error).to.be.an.instanceof(UnknownMethodException);
  });

  test('Check request() method return valid instance of Request', function() {
    let actualResult = null;

    actualResult = action.request({}, 'POST');

    chai.assert.instanceOf(
      actualResult, Request, 'is an instance of Request');
    chai.expect(actualResult.cacheImpl).to.be.eql(action._resource.cache);
  });
});