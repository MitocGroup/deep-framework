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
  let cache = new Cache();
  let backendKernelInstance = null;
  let memoryDriverName = 'memory';
  let redisDriverName = 'redis';
  let negativeDriverName = 'test';
  let inMemoryDriver = null;

  test('Class Cache exists in Cache', function() {
    chai.expect(typeof Cache).to.equal('function');
  });

  test('Check driver setter sets driver value', function() {
    inMemoryDriver = new InMemoryDriver();
    cache.driver = inMemoryDriver;
    chai.expect(cache.driver).to.be.eql(inMemoryDriver);
  });

  test('Check service getter returns driver value', function() {
    chai.expect(cache.service).to.be.eql(inMemoryDriver);
  });

  test('Load backend kernel by using Kernel.load()', function(done) {
    let callback = (backendKernel) => {
      chai.assert.instanceOf(backendKernel, Kernel, 'backendKernel is an instance of Kernel');
      backendKernelInstance = backendKernel;
      cache = backendKernel.get('cache');

      // complete the async
      done();
    };
    KernelFactory.create({Cache: Cache}, callback);
  });

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
});
