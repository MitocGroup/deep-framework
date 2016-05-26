'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {AbstractDriver} from '../../../lib/Local/Driver/AbstractDriver';
import {ServerAlreadyRunningException} from '../../../lib/Local/Driver/Exception/ServerAlreadyRunningException';
import {ServerTtsExceededException} from '../../../lib/Local/Driver/Exception/ServerTtsExceededException';
import {AbstractDriverMock} from '../../Mock/Driver/AbstractDriverMock';

chai.use(sinonChai);

suite('Local/Driver/AbstractDriver', () => {
  let abstractDriver = new AbstractDriverMock();
  let port = 8878;

  test('Class AbstractDriver exists in Local/Driver/AbstractDriver', () => {
    chai.expect(AbstractDriver).to.be.an('function');
  });

  test('Check constructor sets by default _running=false', () => {
    chai.expect(abstractDriver.running).to.be.equal(false);
  });

  test('Check constructor sets by default _teardownHook=false', () => {
    chai.expect(abstractDriver._teardownHook).to.be.equal(false);
  });

  test(
    `Check constructor sets by default _port=${AbstractDriver.DEFAULT_PORT}`,
    () => {
      chai.expect(abstractDriver.port).to.be.equal(AbstractDriver.DEFAULT_PORT);
    }
  );

  test(`Check port setter sets _port=${port}`, () => {
    abstractDriver.port = port;
    chai.expect(abstractDriver.port).to.be.equal(port);
  });

  test('Check DEFAULT_TTS static getter returns value more than 0', () => {
    chai.expect(AbstractDriver.DEFAULT_TTS).to.be.above(0);
  });

  test('Check DEFAULT_PORT static getter returns value more than 0', () => {
    chai.expect(AbstractDriver.DEFAULT_PORT).to.be.above(0);
  });

  test('Check start() method starts driver', () => {
    let spyCallback = sinon.spy();

    abstractDriver.start(spyCallback);

    chai.expect(abstractDriver._running).to.be.equal(true);
    chai.expect(spyCallback).to.have.been.calledWithExactly(null, null);
  });

  test('Check _triggerOnTtsExpired() method', () => {
    let spyCallback = sinon.spy();

    abstractDriver._triggerOnTtsExpired(1, spyCallback);

    chai.expect(spyCallback).to.not.have.been.calledWith();
  });

  //@todo - to be re-worked
  //test(
  //  'Check start() method creates ServerAlreadyRunningException in callback when _running=true',
  //  () => {
  //    let spyCallback = sinon.spy();
  //
  //    abstractDriver.start(spyCallback);
  //
  //    chai.expect(spyCallback).to.have.been.threw;
  //    chai.assert.instanceOf(
  //      spyCallback.args[0][0],
  //      ServerAlreadyRunningException,
  //      'error is an instance of ServerAlreadyRunningException'
  //    );
  //  }
  //);

  test('Check restart() method restarts driver', () => {

    let spyCallback = sinon.spy();

    abstractDriver.restart(spyCallback);

    chai.expect(abstractDriver._running).to.be.equal(true);
    chai.expect(spyCallback).to.have.been.calledWithExactly(null, null);
  });

  test('Check stop() method stops driver when it is running', () => {
    let spyCallback = sinon.spy();

    abstractDriver.stop(spyCallback);

    chai.expect(abstractDriver._running).to.be.equal(false);
    chai.expect(spyCallback).to.have.been.calledWithExactly(null, null);
  });

  test('Check stop() method when it is not running', () => {
    let spyCallback = sinon.spy();

    abstractDriver.stop(spyCallback);

    chai.expect(abstractDriver._running).to.be.equal(false);
    chai.expect(spyCallback).to.have.been.calledWithExactly(null);
  });

  test(
    'Check _registerTeardownHook() method returns valid object with _teardownHook=true',
    () => {
      let expectedResult = {
        _port: port,
        _running: false,
        _teardownHook: true,
      };

      let actualResult = abstractDriver._registerTeardownHook();

      chai.expect(actualResult.port).to.equal(expectedResult._port);
      chai.expect(actualResult.running).to.equal(expectedResult._running);
      chai.expect(actualResult._teardownHook).to.equal(expectedResult._teardownHook);
    }
  );

  //@todo - to be re-worked
  //test('Check ServerTtsExceededException can be thrown', () => {
  //  let error = null;
  //
  //  try {
  //    abstractDriver.throwServerTtsExceededException('driver', 1);
  //  } catch (e) {
  //    error = e;
  //  }
  //
  //  chai.assert.instanceOf(
  //    error, ServerTtsExceededException, 'error is an instance of ServerTtsExceededException'
  //  );
  //});
});
