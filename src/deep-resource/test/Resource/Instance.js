'use strict';

import chai from 'chai';
import {Resource} from '../../lib.compiled/Resource';
import {Request} from '../../lib.compiled/Resource/Request';
import {Instance} from '../../lib.compiled/Resource/Instance';
import {Action} from '../../lib.compiled/Resource/Action';
import {MissingActionException} from '../../lib.compiled/Exception/MissingResourceException';
import Kernel from 'deep-kernel';
import Cache from 'deep-cache';
import Security from 'deep-security';
import KernelFactory from '../common/KernelFactory';
import backendConfig from '../common/backend-cfg-json';

suite('Resource/Instance', function() {
  let actionName = 'say-hello';
  let resourceName = 'sample';
  let microserviceIdentifier = 'hello.world.example';
  let instance = null;
  let action = null;
  let backendKernelInstance = null;

  test('Class Instance exists in Resource/Instance', function() {
    chai.expect(typeof Instance).to.equal('function');
  });

  test('Load Kernel by using Kernel.load()', function(done) {
    let callback = (backendKernel) => {
      chai.assert.instanceOf(
        backendKernel, Kernel, 'backendKernel is an instance of Kernel');

      backendKernelInstance = backendKernel;
      instance = backendKernel.get('resource').get(
        `@${microserviceIdentifier}:${resourceName}`
      );
      action = backendKernel.get('resource').get(
        `@${microserviceIdentifier}:${resourceName}:${actionName}`
      );

      chai.assert.instanceOf(
        instance, Instance, 'instance is an instance of Instance'
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

  test('Check constructor sets _name', function() {
    chai.expect(instance.name).to.be.equal(resourceName);
  });

  test('Check constructor sets _rawActions', function() {
    let expectedResult = backendConfig
      .microservices[microserviceIdentifier]
      .resources[resourceName];
    chai.expect(instance._rawActions).to.be.equal(expectedResult);
  });

  test('Check constructor sets _actions', function() {
    chai.expect(Object.keys(instance.actions).length).to.be.equal(3);
  });

  test('Check constructor sets _localBackend=false', function() {
    chai.expect(instance.localBackend).to.be.equal(false);
  });

  test('Check cache() getter/setter', function() {
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

  test('Check localBackend() setter sets _localBackend=true', function() {
    instance.localBackend = false;
    chai.expect(instance.localBackend).to.be.equal(false);
    instance.localBackend = true;
    chai.expect(instance.localBackend).to.be.equal(true);
  });

  test('Check security() getter/setter', function() {
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

  test('Check has() method returns false', function() {
    chai.expect(instance.has('find')).to.be.equal(false);
  });

  test('Check has() method returns true', function() {
    chai.expect(instance.has(actionName)).to.be.equal(true);
  });

  test('Check action() method throws "MissingActionException" exception',
    function() {

      let error = null;
      let testAction = 'find';

      try {
        instance.action(testAction);
      } catch (e) {
        error = e;
      }

      chai.expect(error).to.be.not.equal(null);
      chai.expect(error.message).to.be.equal(`Missing action ${testAction} in ${resourceName} resource.`);
    }
  );

  test('Check action() method returns valid action',
    function() {

      let actualResult = instance.action(actionName);

      chai.assert.instanceOf(
        actualResult, Action, 'result is an instance of Action'
      );
      chai.expect(actualResult.name).to.be.equal(actionName);
    }
  );

  test('Check request() method return valid instance of Request', function() {
    let actualResult = instance.request(actionName, {}, 'POST');

    chai.assert.instanceOf(
      actualResult, Request, 'is an instance of Request'
    );
    chai.expect(actualResult.cacheImpl).to.be.eql(action._resource.cache);
  });
});
