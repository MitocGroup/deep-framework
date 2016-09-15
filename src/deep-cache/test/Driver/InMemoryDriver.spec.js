'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {InMemoryDriver} from '../../lib/Driver/InMemoryDriver';

chai.use(sinonChai);

suite('Driver/InMemoryDriver', () => {
  let inMemoryDriver = new InMemoryDriver();
  let testKey = 'test_key';
  let testValue = {value: 'test_value'};
  let ttl = 100;

  test('Class InMemoryDriver exists in Driver/InMemoryDriver', () => {
    chai.expect(InMemoryDriver).to.be.an('function');
  });

  test('Check constructor sets by default _storage={}', () => {
    chai.expect(inMemoryDriver.storage).to.be.eql({});
  });

  test(
    'Check _now static getter returns Date (3 last chars ignored)',
    () => {
      let approxTime = new Date().getTime().toString();

      approxTime = approxTime.substr(0, approxTime.length - 3);
      chai.expect(InMemoryDriver._now.toString()).to.be.contains(approxTime);
    }
  );

  test('Check has() executes without error and calls callback(null, false)',
    () => {
      let spyCallback = sinon.spy();

      inMemoryDriver._has(testKey, spyCallback);
      chai.expect(spyCallback).to.have.been.calledWithExactly(null, false);
    }
  );

  test('Check has() executes without error and calls callback(null, true)',
    () => {
      let spySetCallback = sinon.spy();
      let spyHasCallback = sinon.spy();

      inMemoryDriver._set(testKey, testValue, 100000, spySetCallback);
      chai.expect(spySetCallback).to.have.been.calledWithExactly(null, true);
      inMemoryDriver._has(testKey, spyHasCallback);
      chai.expect(spyHasCallback).to.have.been.calledWithExactly(null, true);
    });

  test('Check _get() method executes without error and calls callback',
    () => {
      let spyCallback = sinon.spy();
      inMemoryDriver._set(testKey, testValue, 10000);
      inMemoryDriver._get(testKey, spyCallback);

      chai.expect(spyCallback).to.have.been.calledWith(null);

      //check value from args passed to callback
      chai.expect(spyCallback.args[0][1]).to.be.eql(testValue);
    }
  );

  test(
    'Check _invalidate(timeout = 0) executes without error and calls callback',
    () => {
      let spyInvalidateCb = sinon.spy();
      let spyHasCb = sinon.spy();

      inMemoryDriver._invalidate(testKey, 0, spyInvalidateCb);
      chai.expect(spyInvalidateCb).to.have.been.calledWithExactly(null, true);

      inMemoryDriver._has(testKey, spyHasCb);
      chai.expect(spyHasCb).to.have.been.calledWithExactly(null, false);
    }
  );

  test(
    'Check _invalidate(timeout > 0) executes without error and calls callback',
    () => {
      let ttlToInvalidate = 1111;
      let spySetCb = sinon.spy();
      let spyInvalidateCb = sinon.spy();
      let spyGetCb = sinon.spy();

      inMemoryDriver._set(testKey, testValue, ttl, spySetCb);
      inMemoryDriver._get(testKey, spyGetCb);
      let expectedResult = spyGetCb.args[0][1];

      inMemoryDriver._invalidate(testKey, ttlToInvalidate, spyInvalidateCb);
      inMemoryDriver._get(testKey, spyGetCb);
      let actualResult = spyGetCb.args[0][1];

      chai.expect(spyInvalidateCb).to.have.been.calledWithExactly(null, true);
      chai.expect(actualResult).to.be.equal(expectedResult);
    }
  );

  test('Check _flush() method executes without error and calls callback',
    () => {
      let spyCallback = sinon.spy();

      inMemoryDriver._set(testKey, testValue, ttl);
      inMemoryDriver._flush(spyCallback);

      chai.expect(spyCallback).to.have.been.calledWith(null, true);
      chai.expect(inMemoryDriver.storage).to.eql({});
    }
  );
});
