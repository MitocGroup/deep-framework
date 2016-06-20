'use strict';

import chai from 'chai';
import {Resource} from '../../lib/Resource';
import {Request} from '../../lib/Resource/Request';
import {Instance} from '../../lib/Resource/Instance';
import {Action} from '../../lib/Resource/Action';
import {MissingActionException} from '../../lib/Resource/Exception/MissingActionException';
import Kernel from 'deep-kernel';
import Cache from 'deep-cache';
import Security from 'deep-security';
import Validation from 'deep-validation';
import Log from 'deep-log';
import KernelFactory from '../common/KernelFactory';
import backendConfig from '../common/backend-cfg-json';

suite('Resource/Instance', () => {
  let resourceName = 'say-hello';
  let actionName = 'create-msg';
  let microserviceIdentifier = 'deep-hello-world';
  let instance = null;
  let action = null;
  let backendKernelInstance = null;

  test('Class Instance exists in Resource/Instance', () => {
    chai.expect(Instance).to.be.an('function');
  });

  test('Load Kernel by using Kernel.load()', (done) => {
    let callback = (backendKernel) => {
      chai.assert.instanceOf(
        backendKernel, Kernel, 'backendKernel is an instance of Kernel');

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

  test('Check getting instance from Kernel instance', () => {
    instance = backendKernelInstance.get('resource').get(
      `@${microserviceIdentifier}:${resourceName}`
    );

    chai.assert.instanceOf(
      instance, Instance, 'instance is an instance of Instance'
    );
  });

  test('Check getting action from Kernel instance', () => {
    action = backendKernelInstance.get('resource').get(
      `@${microserviceIdentifier}:${resourceName}:${actionName}`
    );

    chai.assert.instanceOf(
      action, Action, 'action is an instance of Action'
    );
  });

  test('Check constructor sets _name', () => {
    chai.expect(instance.name).to.be.equal(resourceName);
  });

  test('Check constructor sets _rawActions', () => {
    let expectedResult = backendConfig
      .microservices[microserviceIdentifier]
      .resources[resourceName];
    chai.expect(instance._rawActions).to.be.equal(expectedResult);
  });

  test('Check constructor sets _actions', () => {
    chai.expect(Object.keys(instance.actions).length).to.be.equal(3);
  });

  test('Check constructor sets _localBackend=false', () => {
    chai.expect(instance.localBackend).to.be.equal(false);
  });

  test('Check cache() getter/setter', () => {
    let cache = instance.cache;
    chai.assert.instanceOf(
      cache, Cache, 'cache is an instance of Cache'
    );

    instance.cache = null;
    chai.expect(instance.cache).to.be.equal(null);

    instance.cache = {};
    chai.expect(instance.cache).to.be.eql({});

    instance.cache = cache;
    chai.expect(instance.cache).to.be.eql(cache);
  });

  test('Check localBackend() setter sets _localBackend=true', () => {
    instance.localBackend = false;
    chai.expect(instance.localBackend).to.be.equal(false);
    instance.localBackend = true;
    chai.expect(instance.localBackend).to.be.equal(true);
  });

  test('Check security() getter/setter', () => {
    let security = instance.security;
    chai.assert.instanceOf(
      security, Security, 'security is an instance of Security'
    );

    instance.security = null;
    chai.expect(instance.security).to.be.equal(null);

    instance.security = {};
    chai.expect(instance.security).to.be.eql({});

    instance.security = security;
    chai.expect(instance.security).to.be.eql(security);
  });

  test('Check has() method returns false', () => {
    chai.expect(instance.has('find')).to.be.equal(false);
  });

  test('Check has() method returns true', () => {
    chai.expect(instance.has(actionName)).to.be.equal(true);
  });

  test('Check action() method throws "MissingActionException" exception',
    () => {

      let error = null;
      let testAction = 'find';

      try {
        instance.action(testAction);
      } catch (e) {
        error = e;
      }

      chai.assert.instanceOf(
        error, MissingActionException, 'error is an instance of MissingActionException'
      );
    }
  );

  test('Check action() method returns valid action',
    () => {

      let actualResult = instance.action(actionName);

      chai.assert.instanceOf(
        actualResult, Action, 'result is an instance of Action'
      );
      chai.expect(actualResult.name).to.be.equal(actionName);
    }
  );

  test('Check request() method return valid instance of Request', () => {
    let actualResult = instance.request(actionName, {}, 'POST');

    chai.assert.instanceOf(
      actualResult, Request, 'is an instance of Request'
    );
    chai.expect(actualResult.cacheImpl).to.be.eql(action._resource.cache);
  });
});
