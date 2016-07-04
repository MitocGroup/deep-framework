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
import Log from 'deep-log';
import KernelFactory from '../common/KernelFactory';

suite('Resource/Action', () => {
  let resourceName = 'say-hello';
  let actionName = 'create-msg';
  let actionType = 'lambda';
  let actionMethods = ['POST'];
  let microserviceIdentifier = 'deep-hello-world';
  let actionSource = {
    api: '/deep-hello-world/say-hello/create-msg',
    original: 'arn:aws:lambda:::function:deep-hello-world-say-hello-create-msg',
    _localPath: './src/deep-hello-world/backend/src/say-hello/create-msg/bootstrap.js',
  };
  let actionRegion = 'us-west-2';
  let action = null;
  let backendKernelInstance = null;

  test('Class Action exists in Resource/Action', () => {
    chai.expect(Action).to.be.an('function');
  });

  test('Load Kernel by using Kernel.load()', (done) => {
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
      Log: Log,
    }, callback);
  });

  test('Check getting action from Kernel instance', () => {
    action = backendKernelInstance.get('resource').get(
      `@${microserviceIdentifier}:${resourceName}:${actionName}`
    );

    chai.assert.instanceOf(
      action, Action, 'action is an instance of Action'
    );
  });

  test('Check resource getter returns valid instance of Resource', () => {
    chai.assert.instanceOf(
      action.resource, ResourceInstance,
      'action.resource is an instance of ResourceInstance'
    );
    chai.expect(action.resource.name).to.be.equal(resourceName);
  });

  test(`Check name getter returns ${actionName}`, () => {
    chai.expect(action.name).to.be.equal(actionName);
  });

  test(`Check type getter returns ${actionType}`, () => {
    chai.expect(action.type).to.be.equal(actionType);
  });

  test(`Check methods getter returns ${actionMethods}`, () => {
    chai.expect(action.methods).to.be.eql(actionMethods);
  });

  test(`Check source getter returns ${actionSource}`, () => {
    chai.expect(action.source).to.be.eql(actionSource);
  });

  test(`Check region getter returns ${actionRegion}`, () => {
    chai.expect(action.region).to.be.equal(actionRegion);
  });

  test('Check apiCacheEnabled getter returns false', () => {
    chai.expect(action.apiCacheEnabled).to.be.equal(false);
  });

  test('Check apiCacheTtl getter returns number', () => {
    chai.expect(Number.isInteger(action.apiCacheTtl)).to.be.equal(true);
  });

  test('Check LAMBDA static getter return "lambda"', () => {
    chai.expect(Action.LAMBDA).to.be.equal('lambda');
  });

  test('Check EXTERNAL static getter return "external"', () => {
    chai.expect(Action.EXTERNAL).to.be.equal('external');
  });

  test('Check DEEP_CACHE_QS_PARAM static getter return "_deepQsHash"', () => {
    chai.expect(Action.DEEP_CACHE_QS_PARAM).to.be.equal('_deepQsHash');
  });

  test('Check HTTP_VERBS static getter', () => {
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
    () => {
      let error = null;

      try {
        action.request({}, 'GET');
      } catch (e) {
        error = e;
      }

      chai.expect(error).to.be.an.instanceof(UnknownMethodException);
    }
  );

  test('Check request() method return valid instance of Request', () => {
    let actualResult = action.request({}, 'POST');

    chai.assert.instanceOf(
      actualResult, Request, 'is an instance of Request'
    );
    chai.expect(actualResult.cacheImpl).to.be.eql(action._resource.cache);
  });
});
