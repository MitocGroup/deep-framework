'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {AbstractDriver} from '../../lib/Driver/AbstractDriver';
import {AbstractDriverMock} from '../Mocks/AbstractDriverMock';
chai.use(sinonChai);

suite('Driver/AbstractDriver', function() {
  let abstractDriver = new AbstractDriverMock();
  let buildId = 'testId1';
  let namespace = 'abstractDriverNamespace';
  let silent = true;
  let testKey = 'test_key';
  let testValue = {value: 'test_value'};

  test('Class AbstractDriver exists in Driver/AbstractDriver', function() {
    chai.expect(typeof AbstractDriver).to.equal('function');
  });

  test('Check constructor sets by default _buildId=""', function() {
    chai.expect(abstractDriver.buildId).to.be.equal('');
  });

  test('Check constructor sets by default _namespace=""', function() {
    chai.expect(abstractDriver.namespace).to.be.equal('');
  });

  test('Check constructor sets by default _silent=""', function() {
    chai.expect(abstractDriver.silent).to.be.equal(false);
  });

  test(`Check buildId setter sets value: ${buildId}`, function() {
    //check for empty string
    abstractDriver.buildId = '';
    chai.expect(abstractDriver.buildId).to.be.equal('');

    //check for valid string
    abstractDriver.buildId = buildId;
    chai.expect(abstractDriver.buildId).to.be.equal(buildId);
  });

  test(`Check namespace setter sets value: ${namespace}`, function() {
    //check for empty string
    abstractDriver.namespace = '';
    chai.expect(abstractDriver.namespace).to.be.equal('');

    //check for valid string
    abstractDriver.namespace = namespace;
    chai.expect(abstractDriver.namespace).to.be.equal(namespace);
  });

  test(`Check silent setter sets value: ${silent}`, function() {
    //check for empty string
    abstractDriver.silent = '';
    chai.expect(abstractDriver.silent).to.be.equal('');

    //check for valid string
    abstractDriver.silent = silent;
    chai.expect(abstractDriver.silent).to.be.equal(silent);
  });

  test(`Check _buildKey() method returns:
    ${abstractDriver.buildId}:${abstractDriver.namespace}#${testKey}`,
    function() {
      chai.expect(abstractDriver._buildKey(testKey)).to.be.equal(
        `${abstractDriver.buildId}:${abstractDriver.namespace}#${testKey}`
      );
    }
  );

  test('Check has() method returns valid AbstractDriver object',
    function() {
      abstractDriver.disableFailureMode();

      let spyCallback = sinon.spy();
      let actualResult = abstractDriver.has(testKey, spyCallback);

      chai.assert.instanceOf(
        actualResult,
        AbstractDriver,
        'result of has() is an instance of AbstractDriver'
      );
      chai.expect(actualResult.buildId).to.be.equal(buildId);
      chai.expect(actualResult.silent).to.be.equal(silent);
      chai.expect(actualResult.namespace).to.be.equal(namespace);
      chai.expect(spyCallback).to.have.been.calledWithExactly(
        null,
        AbstractDriverMock.DATA
      );
    }
  );

  test('Check get() method returns valid AbstractDriver object',
    function() {
      abstractDriver.disableFailureMode();

      let spyCallback = sinon.spy();
      let actualResult = abstractDriver.get(testKey, spyCallback);

      chai.assert.instanceOf(actualResult, AbstractDriver,
        'result of get() is an instance of AbstractDriver');
      chai.expect(actualResult.buildId).to.be.equal(buildId);
      chai.expect(actualResult.silent).to.be.equal(silent);
      chai.expect(actualResult.namespace).to.be.equal(namespace);
      chai.expect(spyCallback).to.have.been.calledWithExactly(
        null,
        AbstractDriverMock.DATA
      );
    }
  );

  test('Check get() method throws exception', function() {
    let error = null;
    let spyCallback = sinon.spy();

    abstractDriver.enableFailureMode();

    try {
      abstractDriver.get(testKey, spyCallback);
    } catch (e) {
      error = e;
    }

    let callbackArgs = spyCallback.args[0];
    chai.expect(spyCallback).to.have.been.threw;
    chai.expect(callbackArgs[0].constructor.name).to.equal('DriverException');
  });

  test('Check set() method returns valid AbstractDriver object: ',
    function() {
      let spyCallback = sinon.spy();

      abstractDriver.disableFailureMode();
      abstractDriver.set(testKey, testValue, 1, spyCallback);

      chai.expect(spyCallback).to.have.been.calledWith(
        null,
        AbstractDriverMock.DATA
      );
    }
  );

  test('Check set() method throws exception', function() {

    let error = null;
    let spyCallback = sinon.spy();

    abstractDriver.enableFailureMode();

    try {
      abstractDriver.set(testKey, testValue, spyCallback);
    } catch (e) {
      error = e;
    }

    chai.expect(spyCallback).to.have.been.threw;
  });

  test('Check invalidate() method throws exception', function() {
    let error = null;
    let actualResult = null;
    let spyCallback = sinon.spy();

    abstractDriver.enableFailureMode();

    try {
      actualResult = abstractDriver.invalidate(testKey, 1, spyCallback);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
    chai.assert.instanceOf(actualResult, AbstractDriver,
      'result of invalidate() is an instance of AbstractDriver');
    chai.expect(actualResult.buildId).to.be.equal(buildId);
    chai.expect(actualResult.silent).to.be.equal(silent);
    chai.expect(actualResult.namespace).to.be.equal(namespace);

    let callbackArgs = spyCallback.args[0];
    chai.expect(spyCallback).to.have.been.threw;
    chai.expect(callbackArgs[0].constructor.name).to.equal('DriverException');
  });

  test('Check invalidate() method returns valid AbstractDriver object',
    function() {
      let spyCallback = sinon.spy();

      abstractDriver.disableFailureMode();

      abstractDriver.invalidate(testKey, 1, spyCallback);
      chai.expect(spyCallback).to.have.been.calledWithExactly(
        null,
        AbstractDriverMock.DATA
      );
    }
  );

  test('Check flush() method with valid _flush value', function() {
    let spyCallback = sinon.spy();

    abstractDriver.disableFailureMode();

    abstractDriver.flush(spyCallback);
    chai.expect(spyCallback).to.have.been.calledWithExactly(
      null,
      AbstractDriverMock.DATA
    );
  });

  test('Check flush() method throws exception for invalid _flush value',
    function() {
      let error = null;
      let spyCallback = sinon.spy();

      abstractDriver.enableFailureMode();

      try {
        abstractDriver.flush(spyCallback);
      } catch (e) {
        error = e;
      }

      let callbackArgs = spyCallback.args[0];
      chai.expect(spyCallback).to.have.been.threw;
      chai.expect(callbackArgs[0].constructor.name).to.equal('DriverException');
    }
  );
});
