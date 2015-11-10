'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {Cache} from '../lib.compiled/Cache';
import {InMemoryDriver} from '../lib.compiled/Driver/InMemoryDriver';
import {RedisDriver} from '../lib.compiled/Driver/RedisDriver';
import {Exception} from '../lib.compiled/Exception/Exception';
import Kernel from 'deep-kernel';
import KernelFactory from './common/KernelFactory';

chai.use(sinonChai);

suite('Cache', function() {
  let cache = null;
  let backendKernelInstance = null;
  let memoryDriverName = 'memory';
  let redisDriverName = 'redis';
  let negativeDriverName = 'test';
  let inMemoryDriver = null;

  test('Class Cache exists in Cache', function() {
    chai.expect(typeof Cache).to.equal('function');
  });

  test('Load backend kernel by using Kernel.load()', function(done) {
    let callback = (backendKernel) => {
      chai.assert.instanceOf(backendKernel, Kernel, 'backendKernel is an instance of Kernel');
      backendKernelInstance = backendKernel;
      cache = backendKernel.get('cache');

      //@todo - uncomment when Proxy issue will be fixed by AlexanderC
      //chai.assert.instanceOf(cache, Cache, 'cache is an instance of Cache');

      // complete the async
      done();
    };
    KernelFactory.create({Cache: Cache}, callback);
  });

  test('Check driver setter sets driver value', function() {
    inMemoryDriver = new InMemoryDriver();
    cache.driver = inMemoryDriver;
    chai.expect(cache.driver).to.be.eql(inMemoryDriver);
  });

  //@todo - uncomment when Proxy issue will be fixed by AlexanderC
  //test('Check service getter returns driver value', function() {
  //  chai.expect(cache.service).to.be.eql(inMemoryDriver);
  //});

  test(`Check createDriver() static method for ${memoryDriverName}`,
    function() {
      chai.assert.instanceOf(Cache.createDriver(memoryDriverName),
        InMemoryDriver, 'createDriver() returns an instance of InMemoryDriver');
    }
  );

  test(`Check createDriver() static method for ${redisDriverName}`,
    function() {
      chai.assert.instanceOf(Cache.createDriver(redisDriverName), RedisDriver,
        'createDriver() returns an instance of RedisDriver');
    }
  );

  test('Check createDriver() throws exception', function() {
    let error = null;

    try {
      Cache.createDriver(negativeDriverName);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.an.instanceof(Exception);
  });

  //@todo - uncomment when Proxy issue will be fixed by AlexanderC
  //test('Check boot() method boots a certain service and executes callback',
  //  function() {
  //    let spyCallback = sinon.spy();
  //    cache.boot(backendKernelInstance, spyCallback);
  //    chai.assert.instanceOf(cache.driver,
  //      InMemoryDriver, 'cache.driver ia an instance of InMemoryDriver');
  //    chai.expect(cache.driver.buildId).to.be.equal(backendKernelInstance.buildId);
  //    chai.expect(spyCallback).to.have.been.calledWithExactly();
  //  }
  //);
});
