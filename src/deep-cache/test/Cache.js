'use strict';

import chai from 'chai';
import {Cache} from '../lib.compiled/Cache';
import {InMemoryDriver} from '../lib.compiled/Driver/InMemoryDriver';
import {RedisDriver} from '../lib.compiled/Driver/RedisDriver';
import {Exception} from '../lib.compiled/Exception/Exception';
import Kernel from 'deep-kernel';

suite('Cache', function() {
  let cache = new Cache();
  let driverName = 'driver';
  let memoryDriverName = 'memory';
  let redisDriverName = 'redis';
  let localStorageDriverName = 'local-storage';
  let negativeDriverName = 'test';

  test('Class Cache exists in Cache', function() {
    chai.expect(typeof Cache).to.equal('function');
  });

  test('Check constructor sets _driver = null', function() {
    chai.expect(cache.driver).to.be.an.equal(null);
  });

  test(`Check driver setter sets value ${driverName}`, function() {
    cache.driver = driverName;
    chai.expect(cache.driver).to.be.an.equal(driverName);
  });

  test(`Check service getter returns ${driverName}`, function() {
    chai.expect(cache.service).to.be.an.equal(driverName);
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

  test(`Check createDriver() static method for ${localStorageDriverName}`,
    function() {
      //todo - TBD - window is not defined
      //chai.expect(typeof Cache.createDriver(localStorageDriverName)).to.be.an.equal('object');
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

  test('Check boot() method  for !kernel.isFrontend', function() {
    let deepServices = {serviceName: 'serviceName'};
    let kernel = null;
    let error = null;
    try {
      kernel = new Kernel(deepServices, Kernel.BACKEND_CONTEXT);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
    chai.expect(kernel).to.be.an.instanceof(Kernel);
    chai.assert.instanceOf(kernel, Kernel, 'kernel is an instance of Kernel');

    let callback = ()=> {
      return 'callback called';
    };

    cache.boot(kernel, callback);
  });
});
