'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {AbstractDriver} from '../../lib.compiled/Driver/AbstractDriver';
import {NoFlushException} from '../../lib.compiled/Driver/Exception/NoFlushException';
import {DriverException} from '../../lib.compiled/Driver/Exception/DriverException';
import {MissingCacheException} from '../../lib.compiled/Driver/Exception/MissingCacheException';
chai.use(sinonChai);

class AbstractDriverPositiveTest extends AbstractDriver {
  constructor() {
    super();
  }

  _get(key, callback = null) {
    return callback(null, '_get was executed successfully');
  }

  _has(key, callback = null) {
    return callback(null, '_has was executed successfully');
  }

  _invalidate(key, timeout = 0, callback = null) {
    return callback(null, '_invalidate was executed successfully');
  }

  _set(key, value, ttl = 0, callback = null) {
    return callback(null, '_set was executed successfully');
  }
}

class AbstractDriverTest extends AbstractDriver {
  constructor() {
    super();
  }

  has(key, callback = null) {
    return callback(null, '_has was executed successfully');
  }

  _invalidate(key, timeout = 0, callback = null) {
    return callback(null, '_invalidate was executed successfully');
  }

  _get(key, callback = null) {
    return;
  }

  _has(key, callback = null) {
    return;
  }

  _set(key, value, ttl = 0, callback = null) {
    return;
  }

  set(key, value, ttl = 0, callback = null) {
    throw new DriverException('Implicitly test Driver Exception');
  }
}

class AbstractDriverNegativeTest extends AbstractDriver {
  constructor() {
    super();
  }

  _get(key, callback = null) {
    return callback(null, null);
  }

  _has(key, callback = null) {
    return callback(null, null);
  }

  _invalidate(key, timeout = 0, callback = null) {
    return callback(null, null);
  }

  _set(key, value, ttl = 0, callback = null) {
    throw 'Test exception';
  }

  _flush(callback) {
    return callback('exception', null);
  }
}

suite('Driver/AbstractDriver', function() {
  let abstractDriver = new AbstractDriverPositiveTest();
  let buildId = 'testId1';
  let namespace = 'abstractDriverNamespace';
  let silent = true;
  let key = 'key_test';

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
    abstractDriver.buildId = '';
    chai.expect(abstractDriver.buildId).to.be.equal('');
    abstractDriver.buildId = buildId;
    chai.expect(abstractDriver.buildId).to.be.equal(buildId);
  });

  test(`Check namespace setter sets value: ${namespace}`, function() {
    abstractDriver.namespace = '';
    chai.expect(abstractDriver.namespace).to.be.equal('');
    abstractDriver.namespace = namespace;
    chai.expect(abstractDriver.namespace).to.be.equal(namespace);
  });

  test(`Check silent setter sets value: ${silent}`, function() {
    abstractDriver.silent = '';
    chai.expect(abstractDriver.silent).to.be.equal('');
    abstractDriver.silent = silent;
    chai.expect(abstractDriver.silent).to.be.equal(silent);
  });

  test(`Check _buildKey() method returns: ${abstractDriver.buildId}:${abstractDriver.namespace}#${key}`, function() {
    chai.expect(abstractDriver._buildKey(key)).to.be.equal(`${abstractDriver.buildId}:${abstractDriver.namespace}#${key}`);
  });

  test('Check has() method returns valid AbstractDriver object', function() {
    let spyCallback = sinon.spy();
    let actualResult = abstractDriver.has(key, spyCallback);
    chai.assert.instanceOf(actualResult, AbstractDriver, 'result of has() is an instance of AbstractDriver');
    chai.expect(actualResult.buildId).to.be.equal(buildId);
    chai.expect(actualResult.silent).to.be.equal(silent);
    chai.expect(actualResult.namespace).to.be.equal(namespace);
    chai.expect(spyCallback).to.have.been.calledWithExactly(null, '_has was executed successfully');
  });

  test('Check get() method returns valid AbstractDriver object', function() {
    let spyCallback = sinon.spy();
    let actualResult = abstractDriver.get(key, spyCallback);
    chai.assert.instanceOf(actualResult, AbstractDriver, 'result of get() is an instance of AbstractDriver');
    chai.expect(actualResult.buildId).to.be.equal(buildId);
    chai.expect(actualResult.silent).to.be.equal(silent);
    chai.expect(actualResult.namespace).to.be.equal(namespace);
    chai.expect(spyCallback).to.have.been.calledWithExactly(null, '_get was executed successfully');
  });

  test('Check get() method throws exception', function() {
    let abstractDriverNegativeTest = new AbstractDriverNegativeTest();
    let error = null;
    let spyCallback = sinon.spy();
    try {
      abstractDriverNegativeTest.get(key, spyCallback);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
    chai.expect(spyCallback).to.have.been.threw;
  });

  test('Check set() method returns valid AbstractDriver object: ', function() {
    let spyCallback = sinon.spy();
    let actualResult = abstractDriver.set(key, 'testValue', 1, spyCallback);
    chai.expect(spyCallback).to.have.been.calledWith(undefined, null);
  });

  test('Check set() method throws exception', function() {
    let abstractDriverNegativeTest = new AbstractDriverNegativeTest();
    let error = null;
    let spyCallback = sinon.spy();
    try {
      abstractDriverNegativeTest.set(key, 'testValue', spyCallback);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
    chai.expect(spyCallback).to.have.been.threw;
  });

  test('Check invalidate() method throws exception', function() {
    let error = null;
    let actualResult = null;
    let spyCallback = sinon.spy();
    try {
      actualResult = abstractDriver.invalidate(key, 1, spyCallback);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
    chai.assert.instanceOf(actualResult, AbstractDriver, 'result of invalidate() is an instance of AbstractDriver');
    chai.expect(actualResult.buildId).to.be.equal(buildId);
    chai.expect(actualResult.silent).to.be.equal(silent);
    chai.expect(actualResult.namespace).to.be.equal(namespace);
    chai.expect(spyCallback).to.have.been.threw;
  });

  test('Check invalidate() method returns valid AbstractDriver object', function() {
    let abstractDriverNegativeTest = new AbstractDriverTest();
    let spyCallback = sinon.spy();
    abstractDriverNegativeTest.invalidate(key, 1, spyCallback);
    chai.expect(spyCallback).to.have.been.calledWith();
  });

  test('Check flush() method with valid _flush value', function() {
    let abstractDriverNegativeTest = new AbstractDriverNegativeTest();
    let spyCallback = sinon.spy();
    abstractDriverNegativeTest.flush(spyCallback);
    chai.expect(spyCallback).to.have.been.calledWith(undefined, 'exception');
  });

  test('Check flush() method throws "NoFlushException" exception for invalid _flush value', function () {
    let error = null;
    let spyCallback = sinon.spy();
    try {
      abstractDriver._flush = undefined;
      abstractDriver.flush(spyCallback);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
    chai.expect(spyCallback).to.have.been.threw;
  });
});