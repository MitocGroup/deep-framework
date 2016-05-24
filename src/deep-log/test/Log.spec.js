'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {Log} from '../lib/Log';
import {ConsoleDriver} from '../lib/Driver/ConsoleDriver';
import {ConsoleDriverMock} from './Mock/ConsoleDriverMock';
import Core from 'deep-core';
import Kernel from 'deep-kernel';
import KernelFactory from './common/KernelFactory';

chai.use(sinonChai);

suite('Log', () => {
  let log = null;
  let backendKernelInstance = null;
  let frontendKernelInstance = null;
  let consoleDriverMock = new ConsoleDriverMock();

  test('Class Log exists in Log', () => {
    chai.expect(Log).to.be.an('function');
  });

  test('Load Kernels by using Kernel.load()', (done) => {
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
      log.localBackend = true;

      // complete the async
      done();
    };

    KernelFactory.create({Log: Log}, callback);
  });

  test('Check EMERGENCY static getter returns "emergency"', () => {
    chai.expect(Log.EMERGENCY).to.be.equal('emergency');
  });

  test('Check ALERT static getter returns "alert"', () => {
    chai.expect(Log.ALERT).to.be.equal('alert');
  });

  test('Check CRITICAL static getter returns "critical"', () => {
    chai.expect(Log.CRITICAL).to.be.equal('critical');
  });

  test('Check ERROR static getter returns "error"', () => {
    chai.expect(Log.ERROR).to.be.equal('error');
  });

  test('Check WARNING static getter returns "warning"', () => {
    chai.expect(Log.WARNING).to.be.equal('warning');
  });

  test('Check NOTICE static getter returns "notice"', () => {
    chai.expect(Log.NOTICE).to.be.equal('notice');
  });

  test('Check INFO static getter returns "info"', () => {
    chai.expect(Log.INFO).to.be.equal('info');
  });

  test('Check DEBUG static getter returns "debug"', () => {
    chai.expect(Log.DEBUG).to.be.equal('debug');
  });

  test('Check LEVELS static getter returns array of levels', () => {
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

  //@todo - to be updated
  //test(
  //  'Check create() method throws "Core.Exception.InvalidArgumentException" for invalid driver type',
  //  () => {
  //    let error = null;
  //    try {
  //      log.create('test');
  //    } catch (e) {
  //      error = e;
  //    }
  //
  //    chai.expect(error).to.be.an.instanceof(
  //      Core.Exception.InvalidArgumentException
  //    );
  //  }
  //);

  test('Check boot() method register service', () => {
    let spyCallback = sinon.spy();

    log.boot(backendKernelInstance, spyCallback);

    chai.expect(spyCallback).to.have.been.calledWithExactly();
  });

  //@todo - to be updated
  //test('Check register() method throws exception for invalid driver', () => {
  //    let error = null;
  //    try {
  //      log.register({});
  //    } catch (e) {
  //      error = e;
  //    }
  //
  //    chai.expect(error).to.be.an.instanceof(
  //      Core.Exception.InvalidArgumentException
  //    );
  //  }
  //);

  test('Check register() method register driver for console', () => {
      log = new Log();

      let actualResult = log.register(consoleDriverMock);
      chai.assert.instanceOf(
        actualResult,
        Log,
        'register() method registers and returns an instance of ConsoleDriver'
      );

      //check the added driver
      chai.expect(log.drivers.iterator[log.drivers.iterator.length - 1].constructor.name).to.be.equal(
        consoleDriverMock.constructor.name
      );
    }
  );

  test('Check log() method runs without exception', () => {
    let level = 'debug';
    let msg = 'test debug log() from Log';
    let context = {context: 'Test context'};

    let actualResult = log.log(msg, level, context);
    let actualMsg = log.drivers.iterator[log.drivers.iterator.length - 1].logs.pop();

    chai.assert.instanceOf(
      actualResult,
      Log,
      'register() method registers and returns an instance of ConsoleDriver'
    );
    chai.expect(actualMsg[0]).to.eql(msg);
    chai.expect(actualMsg[1]).to.eql(level);
    chai.expect(actualMsg[2]).to.eql(context);
  });

  test('Check error()', () => {
    let msg = 'test error log() from Log';
    let context = {context: 'Test context'};

    log.error(msg, context);

    let actualResult = log.drivers.iterator[log.drivers.iterator.length - 1].logs.pop();
    chai.expect(actualResult[0]).to.eql(msg);
    chai.expect(actualResult[1]).to.eql('error');
    chai.expect(actualResult[2]).to.eql(context);
  });

  test('Check info()', () => {
    let msg = 'test info log() from Log';
    let context = {context: 'Test context'};

    log.info(msg, context);

    let actualResult = log.drivers.iterator[log.drivers.iterator.length - 1].logs.pop();
    chai.expect(actualResult[0]).to.eql(msg);
    chai.expect(actualResult[1]).to.eql('info');
    chai.expect(actualResult[2]).to.eql(context);
  });

  test('Check warning()', () => {
    let msg = 'test warning log() from Log';
    let context = {context: 'Test context'};

    log.warning(msg, context);

    let actualResult = log.drivers.iterator[log.drivers.iterator.length - 1].logs.pop();
    chai.expect(actualResult[0]).to.eql(msg);
    chai.expect(actualResult[1]).to.eql('warning');
    chai.expect(actualResult[2]).to.eql(context);
  });

  test('Check emergency()', () => {
    let msg = 'test emergency log() from Log';
    let context = {context: 'Test context'};

    log.emergency(msg, context);

    let actualResult = log.drivers.iterator[log.drivers.iterator.length - 1].logs.pop();
    chai.expect(actualResult[0]).to.eql(msg);
    chai.expect(actualResult[1]).to.eql('emergency');
    chai.expect(actualResult[2]).to.eql(context);
  });

  test('Check critical()', () => {
    let msg = 'test critical log() from Log';
    let context = {context: 'Test context'};

    log.critical(msg, context);

    let actualResult = log.drivers.iterator[log.drivers.iterator.length - 1].logs.pop();
    chai.expect(actualResult[0]).to.eql(msg);
    chai.expect(actualResult[1]).to.eql('critical');
    chai.expect(actualResult[2]).to.eql(context);
  });

  test('Check notice()', () => {
    let msg = 'test notice log() from Log';
    let context = {context: 'Test context'};

    log.notice(msg, context);

    let actualResult = log.drivers.iterator[log.drivers.iterator.length - 1].logs.pop();
    chai.expect(actualResult[0]).to.eql(msg);
    chai.expect(actualResult[1]).to.eql('notice');
    chai.expect(actualResult[2]).to.eql(context);
  });

  test('Check alert()', () => {
    let msg = 'test alert log() from Log';
    let context = {context: 'Test context'};

    log.alert(msg, context);

    let actualResult = log.drivers.iterator[log.drivers.iterator.length - 1].logs.pop();
    chai.expect(actualResult[0]).to.eql(msg);
    chai.expect(actualResult[1]).to.eql('alert');
    chai.expect(actualResult[2]).to.eql(context);
  });

  test(
    'Check overrideJsConsole() method returns object and executes debug',
    () => {

      let msg = 'test debug log() from Log';
      let context = {context: 'Test context'};

      log.overrideJsConsole();
      log.debug(msg, context);

      let actualResult = log.drivers.iterator[log.drivers.iterator.length - 1].logs.pop();
      chai.expect(actualResult[0]).to.eql(msg);
      chai.expect(actualResult[1]).to.eql('debug');
      chai.expect(actualResult[2]).to.eql(context);
    }
  );

  test('Check register().create() method returns log driver for "console"', () => {
    log.register('console');

    chai.assert.instanceOf(
      log.drivers.iterator[0],
      ConsoleDriver,
      'create() method returns an instance of ConsoleDriver'
    );
  });
});
