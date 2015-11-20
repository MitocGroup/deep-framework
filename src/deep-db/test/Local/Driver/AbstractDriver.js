'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {AbstractDriver} from '../../../lib.compiled/Local/Driver/AbstractDriver';
import {ServerAlreadyRunningException} from '../../../lib.compiled/Local/Driver/Exception/ServerAlreadyRunningException';
import {ServerTtsExceededException} from '../../../lib.compiled/Local/Driver/Exception/ServerTtsExceededException';
import {AbstractDriverMock} from '../../Mock/Driver/AbstractDriverMock';

chai.use(sinonChai);

suite('Local/Driver/AbstractDriver', function() {
  let abstractDriver = new AbstractDriverMock();
  let port = 8878;

  test('Class AbstractDriver exists in Local/Driver/AbstractDriver', function() {
    chai.expect(typeof AbstractDriver).to.equal('function');
  });

  test('Check constructor sets by default _running=false', function() {
    chai.expect(abstractDriver.running).to.be.equal(false);
  });

  test('Check constructor sets by default _teardownHook=false', function() {
    chai.expect(abstractDriver._teardownHook).to.be.equal(false);
  });

  test(
    `Check constructor sets by default _port=${AbstractDriver.DEFAULT_PORT}`,
    function() {
      chai.expect(abstractDriver.port).to.be.equal(AbstractDriver.DEFAULT_PORT);
    }
  );

  test(`Check port setter sets _port=${port}`, function() {
    abstractDriver.port = port;
    chai.expect(abstractDriver.port).to.be.equal(port);
  });

  test('Check DEFAULT_TTS static getter returns value more than 0', function() {
    chai.expect(AbstractDriver.DEFAULT_TTS).to.be.above(0);
  });

  test('Check DEFAULT_PORT static getter returns value more than 0', function() {
    chai.expect(AbstractDriver.DEFAULT_PORT).to.be.above(0);
  });

  test('Check start() method starts driver', function() {
    let spyCallback = sinon.spy();

    abstractDriver.start(spyCallback);

    chai.expect(abstractDriver._running).to.be.equal(true);
    chai.expect(spyCallback).to.have.been.calledWithExactly(null, null);
  });

  test('Check _triggerOnTtsExpired() method', function() {
    let spyCallback = sinon.spy();

    abstractDriver._triggerOnTtsExpired(1, spyCallback);

    chai.expect(spyCallback).to.not.have.been.calledWith();
  });

  test(
    'Check start() method creates ServerAlreadyRunningException in callback when _running=true',
    function() {
      let error = null;
      let spyCallback = sinon.spy();

      abstractDriver.start(spyCallback);

      chai.expect(spyCallback).to.have.been.threw;
      chai.assert.instanceOf(
        spyCallback.args[0][0],
        ServerAlreadyRunningException,
        'error is an instance of ServerAlreadyRunningException'
      );
    }
  );

  //test('Check restart() method restarts driver', function() {
  //  let error = null;
  //  let actualResult = null;
  //  let spyCallback = sinon.spy();
  //  let expectedResult = {
  //    _port: port,
  //    _running: true,
  //    _teardownHook: true,
  //  };
  //
  //  try {
  //    actualResult = abstractDriver.restart(spyCallback);
  //  } catch (e) {
  //    error = e;
  //  }
  //
  //  chai.expect(error).to.be.equal(null);
  //  chai.expect(actualResult).to.be.eql(expectedResult);
  //  chai.expect(spyCallback).to.have.been.called;
  //});
  //
  //test('Check stop() method stops driver', function() {
  //  let error = null;
  //  let actualResult = null;
  //  let expectedResult = {
  //    _port: port,
  //    _running: false,
  //    _teardownHook: true,
  //  };
  //  let spyCallback = sinon.spy();
  //
  //  try {
  //    actualResult = abstractDriver.stop(spyCallback);
  //  } catch (e) {
  //    error = e;
  //  }
  //
  //  chai.expect(error).to.be.equal(null);
  //  chai.expect(actualResult).to.be.eql(expectedResult);
  //  chai.expect(spyCallback).to.have.been.called;
  //});
  //
  //test('Check _triggerOnTtsExpired() method for running=false', function() {
  //  let error = null;
  //  let spyCallback = sinon.spy();
  //  chai.expect(abstractDriver.running).to.be.equal(false);
  //
  //  try {
  //    abstractDriver._triggerOnTtsExpired(1, spyCallback);
  //  } catch (e) {
  //    error = e;
  //  }
  //
  //  chai.expect(error).to.be.equal(null);
  //});
  //
  //test('Check restart() method call', function() {
  //  let abstractDriverWithStopError = new AbstractDriverWithStopError();
  //  let error = null;
  //  let spyCallback = sinon.spy();
  //
  //  try {
  //    abstractDriverWithStopError.restart(spyCallback);
  //    abstractDriverWithStopError.restart(spyCallback);
  //  } catch (e) {
  //    error = e;
  //  }
  //
  //  chai.expect(error).to.be.equal(null);
  //  chai.expect(spyCallback).to.have.been.calledWith('error');
  //});
  //
  //test('Check _triggerOnTtsExpired() method for running=true', function() {
  //  let error = null;
  //  let spyCallback = sinon.spy();
  //
  //  try {
  //    abstractDriver._triggerOnTtsExpired(1, spyCallback);
  //  } catch (e) {
  //    error = e;
  //  }
  //
  //  chai.expect(error).to.be.equal(null);
  //  chai.expect(spyCallback).to.not.have.been.called;
  //});
  //
  //test('Check _registerTeardownHook() method returns valid object with _teardownHook=true', function() {
  //  let error = null;
  //  let actualResult = null;
  //  let expectedResult = {
  //    _port: port,
  //    _running: false,
  //    _teardownHook: true,
  //  };
  //
  //  try {
  //    actualResult = abstractDriver._registerTeardownHook();
  //  } catch (e) {
  //    error = e;
  //  }
  //
  //  chai.expect(error).to.be.equal(null);
  //  chai.expect(actualResult).to.be.eql(expectedResult);
  //});
  //
  //test('Check ServerTtsExceededException can be thrown', function() {
  //  let error = null;
  //  let abstractDriverWithStopError = new AbstractDriverWithStopError();
  //  try {
  //    abstractDriverWithStopError.throwServerTtsExceededException('driver', 1);
  //  } catch (e) {
  //    error = e;
  //  }
  //
  //  chai.expect(error).to.be.not.equal(null);
  //  chai.assert.instanceOf(error, ServerTtsExceededException, 'error is an instance of ServerTtsExceededException');
  //});
});
