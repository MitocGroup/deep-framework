'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {Cache} from '../lib/Cache';
import {SharedCache} from '../lib/SharedCache';
import {InMemoryDriver} from '../lib/Driver/InMemoryDriver';
import {RedisDriver} from '../lib/Driver/RedisDriver';
import {CloudFrontDriver} from '../lib/Driver/CloudFrontDriver';
import {Exception} from '../lib/Exception/Exception';
import {AbstractDriverMock} from './Mocks/AbstractDriverMock';
import Kernel from 'deep-kernel';
import Log from 'deep-log';
import KernelFactory from './common/KernelFactory';

chai.use(sinonChai);

suite('Cache', () => {
  let cache = null;
  let backendKernelInstance = null;
  let memoryDriverName = 'memory';
  let redisDriverName = 'redis';
  let cloudFrontDriverName = 'cloud-front';
  let negativeDriverName = 'test';
  let inMemoryDriver = null;

  test('Class Cache exists in Cache', () => {
    chai.expect(Cache).to.be.an('function');
  });

  test('Load backend kernel by using Kernel.load()', (done) => {
    let callback = (backendKernel) => {

      chai.assert.instanceOf(
        backendKernel, Kernel, 'backendKernel is an instance of Kernel'
      );

      backendKernelInstance = backendKernel;
      cache = backendKernel.get('cache');

      chai.assert.instanceOf(cache, Cache, 'cache is an instance of Cache');

      // complete the async
      done();
    };

    KernelFactory.create({
      Cache: Cache,
      Log: Log,
    }, callback);
  });

  test('Check driver setter sets driver value', () => {
    inMemoryDriver = new InMemoryDriver();

    cache.driver = inMemoryDriver;

    chai.expect(cache.driver).to.be.eql(inMemoryDriver);
  });

  //@todo - uncomment when issue (TypeError: Cannot redefine property: has) will be fixed by AlexanderC
  //test('Check service getter returns driver value', () => {
  //  chai.expect(cache.service).to.be.eql(inMemoryDriver);
  //});

  test(`Check createDriver() static method for ${memoryDriverName}`,
    () => {
      chai.assert.instanceOf(
        Cache.createDriver(memoryDriverName),
        InMemoryDriver, 'createDriver() returns an instance of InMemoryDriver'
      );
    }
  );

  test(`Check createDriver() static method for ${redisDriverName}`,
    () => {
      chai.assert.instanceOf(
        Cache.createDriver(redisDriverName),
        RedisDriver,
        'createDriver() returns an instance of RedisDriver'
      );
    }
  );

  test(`Check createDriver() static method for ${cloudFrontDriverName}`,
    () => {
      chai.assert.instanceOf(
        Cache.createDriver(cloudFrontDriverName),
        CloudFrontDriver,
        'createDriver() returns an instance of CloudFrontDriver'
      );
    }
  );

  //@todo - need to be updated
  //test('Check createDriver() throws exception', () => {
  //  let error = null;
  //
  //  try {
  //    Cache.createDriver(negativeDriverName);
  //  } catch (e) {
  //    error = e;
  //  }
  //
  //  chai.expect(error).to.be.an.instanceof(Exception);
  //});

  test('Check boot() method boots a certain service and executes callback',
    () => {
      let spyCallback = sinon.spy();

      cache.boot(backendKernelInstance, spyCallback);

      chai.assert.instanceOf(
        cache.driver, InMemoryDriver, 'cache.driver ia an instance of InMemoryDriver'
      );
      chai.expect(cache.driver.buildId).to.be.equal(backendKernelInstance.buildId);
      chai.expect(cache.shared, 'is an instance of SharedCache').to.be.an.instanceOf(SharedCache);
      chai.expect(spyCallback).to.have.been.calledWithExactly();
    }
  );

  test('Check apply()', () => {
    let abstractDriver = new AbstractDriverMock();
    let buildId = 'testId1';
    let namespace = 'abstractDriverNamespace';
    let testKey = 'test_key';
    let error = null;

    abstractDriver.buildId = buildId;
    abstractDriver.namespace = namespace;

    try {
      cache.apply(abstractDriver._buildKey, testKey);
    } catch (e) {
      error = e;
    }

    //chai.expect(actualResult).to.be.equal(`${buildId}:${namespace}#${testKey}`);
  });


});
