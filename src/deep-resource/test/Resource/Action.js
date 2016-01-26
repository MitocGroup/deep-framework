'use strict';

import chai from 'chai';
import {Action} from '../../lib/Resource/Action';
import {Request} from '../../lib/Resource/Request';
import {Resource} from '../../lib/Resource';
import {Instance as ResourceInstance} from '../../lib/Resource/Instance';
import {UnknownMethodException} from '../../lib/Resource/Exception/UnknownMethodException';
import Kernel from 'deep-kernel';
import Cache from 'deep-cache';
import Security from 'deep-security';
import Validation from 'deep-validation';
import KernelFactory from '../common/KernelFactory';

suite('Resource/Action', function() {
  let actionName = 'say-hello';
  let resourceName = 'sample';
  let actionType = 'lambda';
  let actionMethods = ['POST'];
  let microserviceIdentifier = 'hello.world.example';
  let actionSource = {
    api: 'https://1zf47jpvxd.execute-api.us-west-2.amazonaws.com/dev/hello-world-example/sample/say-hello',
    original: 'arn:aws:lambda:us-west-2:389615756922:function:DeepDevSampleSayHello64232f3705a',
  };
  let actionRegion = 'us-west-2';
  let action = null;
  let backendKernelInstance = null;

  test('Class Action exists in Resource/Action', function() {
    chai.expect(typeof Action).to.equal('function');
  });

  test('Load Kernel by using Kernel.load()', function(done) {
    let callback = (backendKernel) => {
      chai.assert.instanceOf(
        backendKernel, Kernel, 'backendKernel is an instance of Kernel'
      );

      backendKernelInstance = backendKernel;

      // complete the async
      done();
    };

    KernelFactory.create({
      Cache: Cache,
      Security: Security,
      Resource: Resource,
      Validation: Validation,
    }, callback);
  });

  test('Check getting action from Kernel instance', function() {
    action = backendKernelInstance.get('resource').get(
      `@${microserviceIdentifier}:${resourceName}:${actionName}`
    );

    chai.assert.instanceOf(
      action, Action, 'action is an instance of Action'
    );
  });

  test('Check resource getter returns valid instance of Resource', function() {
    chai.assert.instanceOf(
      action.resource, ResourceInstance,
      'action.resource is an instance of ResourceInstance'
    );
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

  test(`Check source getter returns ${actionSource}`, function() {
    chai.expect(action.source).to.be.eql(actionSource);
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

  test(
    'Check request method throws "UnknownMethodException" for unknow method',
    function() {
      let error = null;

      try {
        action.request({}, 'GET');
      } catch (e) {
        error = e;
      }

      chai.expect(error).to.be.an.instanceof(UnknownMethodException);
    }
  );

  test('Check request() method return valid instance of Request', function() {
    let actualResult = action.request({}, 'POST');

    chai.assert.instanceOf(
      actualResult, Request, 'is an instance of Request'
    );
    chai.expect(actualResult.cacheImpl).to.be.eql(action._resource.cache);
  });
});
