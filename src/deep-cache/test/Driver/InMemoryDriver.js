'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {InMemoryDriver} from '../../lib.compiled/Driver/InMemoryDriver';
chai.use(sinonChai);

suite('Driver/InMemoryDriver', function() {
  let inMemoryDriver = new InMemoryDriver();
  let key = 'test_key';
  let value = 'test_value';

  test('Class InMemoryDriver exists in Driver/InMemoryDriver', function() {
    chai.expect(typeof InMemoryDriver).to.equal('function');
  });

  test('Check constructor sets by default _storage={}', function() {
    chai.expect(inMemoryDriver.storage).to.be.eql({});
  });

  test('Check _now static getter returns Date (3 last chars ignored)', function() {
    let approxTime = new Date().getTime().toString();
    approxTime = approxTime.substr(0, approxTime.length - 3);
    chai.expect(InMemoryDriver._now.toString()).to.be.contains(approxTime);
  });

  test('Check has() method executes without error and calls callback(false)', function() {
    let error = null;
    let spyCallback = sinon.spy();
    try {
      inMemoryDriver._has(key, spyCallback);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
    chai.expect(spyCallback).to.have.been.calledWith(false);
  });

  test('Check has() method executes without error and calls callback(true)', function() {
    let error = null;
    let spyCallback = sinon.spy();
    try {
      inMemoryDriver._set(key, value, 3, spyCallback);
      inMemoryDriver._has(key, spyCallback);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
    chai.expect(spyCallback).to.have.been.calledWith(true);
  });

  test('Check _get() method executes without error and calls callback', function() {
    let error = null;
    try {
      inMemoryDriver._get(key);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
  });

  test('Check _set() method executes without error and calls callback', function() {
    let error = null;
    let spyCallback = sinon.spy();
    try {
      inMemoryDriver._set(key, value, 1, spyCallback);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
    chai.expect(spyCallback).to.have.been.calledWith(true);
  });

  test('Check _invalidate(timeout = 0) method executes without error and calls callback', function() {
    let error = null;
    let spyCallback = sinon.spy();
    try {
      inMemoryDriver._invalidate(key, 0, spyCallback);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
    chai.expect(spyCallback).to.have.been.calledWith(true);
  });

  test('Check _invalidate(timeout > 0) method executes without error and calls callback', function() {
    let error = null;
    let spyCallback = sinon.spy();
    try {
      inMemoryDriver._set(key, value, 1, spyCallback);
      inMemoryDriver._invalidate(key, 1, spyCallback);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
    chai.expect(spyCallback).to.have.been.calledWith(true);
  });

  test('Check _flush() method executes without error and calls callback', function() {
    let error = null;
    let spyCallback = sinon.spy();
    try {
      inMemoryDriver._flush(spyCallback);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
    chai.expect(spyCallback).to.have.been.calledWith(true);
  });
});
