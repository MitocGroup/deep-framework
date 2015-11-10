'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {Resource} from '../lib.compiled/Resource';
import {Instance as ResourceInstance} from '../lib.compiled/Resource/Instance';
import {MissingResourceException} from '../lib.compiled/Exception/MissingResourceException';
import {Instance} from '../node_modules/deep-kernel/lib.compiled/Microservice/Instance';
import Kernel from 'deep-kernel';
import Cache from 'deep-cache';
import Security from 'deep-security';
import KernelFactory from './common/KernelFactory';
import backendConfig from './common/backend-cfg-json';

chai.use(sinonChai);

suite('Resource', function() {
  let microserviceIdentifier = 'hello.world.example';
  let microserviceInstance = new Instance(microserviceIdentifier,
    backendConfig.microservices[microserviceIdentifier].resources);
  let resource = null;
  let resourceName = 'sample';
  let backendKernelInstance = null;

  test('Class Resource exists in Resource', function() {
    chai.expect(typeof Resource).to.equal('function');
  });

  test('Load Kernel by using Kernel.loadFromFile()', function(done) {
    let callback = (backendKernel) => {
      chai.assert.instanceOf(
        backendKernel, Kernel, 'backendKernel is an instance of Kernel');
      backendKernelInstance = backendKernel;
      resource = backendKernel.get('resource');
      chai.assert.instanceOf(
        resource, Resource, 'resource is an instance of Resource');

      // complete the async
      done();
    };
    KernelFactory.create({
      Cache: Cache,
      Security: Security,
      Resource: Resource,
    }, callback);
  });

  test('Check constructor sets _resources', function() {
    chai.expect(Object.keys(resource._resources)).to.be.eql(
      ['hello.world.example', 'deep.ng.root']);
  });

  test('Check has() method returns false', function() {
    resource.bind(microserviceInstance);
    chai.expect(resource.has('invalid_res_identifier')).to.be.equal(false);
  });

  test('Check has() method returns true', function() {
    resource.bind(microserviceInstance);
    chai.expect(resource.has(resourceName)).to.be.equal(true);
  });

  test('Check get() method returns valid object', function() {
    let actualResult = resource.get(`@${microserviceIdentifier}:${resourceName}`);
    chai.expect(actualResult.name).to.be.equal(resourceName);
    chai.expect(actualResult._rawActions).to.be.eql(
      backendConfig.microservices[microserviceIdentifier].resources[resourceName]
    );
  });

  test('Check get() method throws \'MissingResourceException\' exception',
    function() {
      let error = null;
      try {
        resource.get(`@${microserviceIdentifier}:invalid_resource_name`);
      } catch (e) {
        error = e;
      }

      chai.expect(error).to.be.not.equal(null);
      chai.assert.instanceOf(error, MissingResourceException,
        'error is an instance of MissingResourceException');
    }
  );

  test('Check list() getter returns', function() {
    let actualResult = resource.list;
    let expectedResult = {
      'deep.ng.root': [],
      'hello.world.example': [
        'sample',
      ],
    };
    chai.expect(actualResult).to.be.eql(expectedResult);
  });

  test('Check boot() method', function() {
    let spyCallback = sinon.spy();
    resource.boot(backendKernelInstance, spyCallback);
    chai.expect(spyCallback).to.have.been.calledWithExactly();
    chai.assert.instanceOf(resource._resources[microserviceIdentifier].sample, ResourceInstance,
      'item is an instance of ResourceInstance');
  });
});
