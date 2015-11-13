'use strict';

import chai from 'chai';
import {Log} from '../lib.compiled/Log';
import {ConsoleDriver} from '../lib.compiled/Driver/ConsoleDriver';
import Core from 'deep-core';
import Kernel from 'deep-kernel';
import KernelFactory from './common/KernelFactory';

suite('Log', function() {
  let log = null;
  let backendKernelInstance = null;
  let frontendKernelInstance = null;

  test('Class Log exists in Log', function() {
    chai.expect(typeof Log).to.equal('function');
  });

  test('Load Kernels by using Kernel.load()', function(done) {
    let callback = (frontendKernel, backendKernel) => {
      chai.assert.instanceOf(
        backendKernel, Kernel, 'backendKernel is an instance of Kernel'
      );
      chai.assert.instanceOf(
        frontendKernel, Kernel, 'frontendKernel is an instance of Kernel'
      );
      backendKernelInstance = backendKernel;
      frontendKernelInstance = frontendKernel;

      log = frontendKernel.get('log');

      // complete the async
      done();
    };

    KernelFactory.create({Log: Log}, callback);
  });

  test('Check EMERGENCY static getter returns "emergency"', function() {
    chai.expect(Log.EMERGENCY).to.be.equal('emergency');
  });

  test('Check ALERT static getter returns "alert"', function() {
    chai.expect(Log.ALERT).to.be.equal('alert');
  });

  test('Check CRITICAL static getter returns "critical"', function() {
    chai.expect(Log.CRITICAL).to.be.equal('critical');
  });

  test('Check ERROR static getter returns "error"', function() {
    chai.expect(Log.ERROR).to.be.equal('error');
  });

  test('Check WARNING static getter returns "warning"', function() {
    chai.expect(Log.WARNING).to.be.equal('warning');
  });

  test('Check NOTICE static getter returns "notice"', function() {
    chai.expect(Log.NOTICE).to.be.equal('notice');
  });

  test('Check INFO static getter returns "info"', function() {
    chai.expect(Log.INFO).to.be.equal('info');
  });

  test('Check DEBUG static getter returns "debug"', function() {
    chai.expect(Log.DEBUG).to.be.equal('debug');
  });

  test('Check LEVELS static getter returns array of levels', function() {
    chai.expect(Log.LEVELS.length).to.be.equal(8);
    chai.expect(Log.LEVELS).to.be.include(Log.EMERGENCY);
    chai.expect(Log.LEVELS).to.be.include(Log.ALERT);
    chai.expect(Log.LEVELS).to.be.include(Log.CRITICAL);
    chai.expect(Log.LEVELS).to.be.include(Log.ERROR);
    chai.expect(Log.LEVELS).to.be.include(Log.WARNING);
    chai.expect(Log.LEVELS).to.be.include(Log.NOTICE);
    chai.expect(Log.LEVELS).to.be.include(Log.INFO);
    chai.expect(Log.LEVELS).to.be.include(Log.DEBUG);
  });

  test('Check log() method runs without exception', function() {

    let actualResult = log.log(
      'test log() from ConsoleDriver', 'debug', 'context'
    );

    //@todo - add smart checks
    //chai.expect(actualResult).to.be.not.eql({});
  });

  test('Check create() method throws "Core.Exception.InvalidArgumentException" exception for invalid driver type', function() {
    let error = null;
    try {
      log.create('test');
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
    chai.expect(error).to.be.an.instanceof(Core.Exception.InvalidArgumentException);
  });

  test('Check create() method returns log driver for console', function() {
    let error = null;
    let actualResult = null;
    try {
      actualResult = log.create('console');
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
    chai.assert.instanceOf(actualResult, ConsoleDriver, 'create() method returns an instance of ConsoleDriver');
  });

  test('Check create() method returns log driver for sentry/raven', function() {
    let error = null;
    let actualResult = null;
    try {
      actualResult = log.create('sentry');
    } catch (e) {
      error = e;
    }
  });

  test('Check boot() method register service', function() {
    let error = null;
    let actualResult = null;
    let deepServices = { serviceName: 'serviceName' };
    let kernel = new Kernel(deepServices, Kernel.FRONTEND_CONTEXT);
    let callback = () => {
      return 'callback called';
    };

    try {
      actualResult = log.boot(kernel, callback);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
  });

  test('Check register() method throws "Core.Exception.InvalidArgumentException" exception for invalid driver', function() {
    let error = null;
    try {
      log.register({key: 'value'});
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
    chai.expect(error).to.be.an.instanceof(Core.Exception.InvalidArgumentException);
  });

  test('Check register() method register driver for console', function() {
    let error = null;
    let actualResult = null;
    try {
      actualResult = log.register('console');
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
    chai.assert.instanceOf(actualResult, Log, 'register() method registers driver ' +
      'and returns an instance of ConsoleDriver');
  });
});
