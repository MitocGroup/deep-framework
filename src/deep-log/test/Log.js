'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {Log} from '../lib.compiled/Log';
import {ConsoleDriver} from '../lib.compiled/Driver/ConsoleDriver';
import Core from 'deep-core';
import Kernel from 'deep-kernel';
import KernelFactory from './common/KernelFactory';
import ravenMock from './Mocks/ravenMock';

chai.use(sinonChai);

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

      //let requestExport = RequireProxy('../../lib.compiled/Resource/Request', {
      //  'superagent': httpMock,
      //});
      //let RequestProxy = requestExport.Request;
      //externalRequest = new RequestProxy(externalAction, payload, method);

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

  test('Check register() method register driver for console', function() {
      let actualResult = log.register('console');
      chai.assert.instanceOf(
        actualResult,
        Log,
        'register() method registers and returns an instance of ConsoleDriver'
      );
      chai.expect(log.drivers.iterator[0].constructor.name).to.be.equal('ConsoleDriver');
    }
  );

  test('Check log() method runs without exception', function() {

    let actualResult = log.log(
      'test log() from ConsoleDriver', 'debug', 'context'
    );

    chai.assert.instanceOf(
      actualResult,
      Log,
      'register() method registers and returns an instance of ConsoleDriver'
    );
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
    let actualResult = log.create('console');

    chai.assert.instanceOf(
      actualResult,
      ConsoleDriver,
      'create() method returns an instance of ConsoleDriver'
    );
  });

  test('Check create() method returns log driver for sentry/raven', function() {
    let actualResult = log.create('console');

    chai.assert.instanceOf(
      actualResult,
      ConsoleDriver,
      'create() method returns an instance of ConsoleDriver'
    );
  });

  test('Check boot() method register service', function() {
    let spyCallback = sinon.spy();

    log.boot(backendKernelInstance, spyCallback);

    chai.expect(spyCallback).to.have.been.calledWithExactly();
  });
});
