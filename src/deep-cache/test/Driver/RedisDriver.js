'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import Redis from 'ioredis';
import {RedisDriver} from '../../lib.compiled/Driver/RedisDriver';
import {RedisClusterException} from '../../lib.compiled/Driver/Exception/RedisClusterException';

chai.use(sinonChai);

class RedisNegativeMock extends Redis {
  /**
   * @param args
   */
  constructor(...args) {
    super(args);
  }

  /**
   * @param {String} key
   * @param {Function} callback
   * @returns {RedisNegativeMock}
   */
  exists(key, callback) {
    callback({
      code: 404,
      message: `Element with ${key} was not found`,
    }, null);

    return this;
  }

  /**
   * @param {String} key
   * @param {Function} callback
   * @returns {RedisNegativeMock}
   */
  get(key, callback) {
    callback({
      code: 404,
      message: `Element with ${key} was not found`,
    }, null);

    return this;
  }

  /**
   * @param {String} key
   * @param {*} value
   * @param {Number} ttl
   * @param {Function} callback
   * @returns {RedisNegativeMock}
   */
  set(key, value, ttl, callback) {
    callback({
      code: 400,
      message: `Key: ${key} or value: ${value} is not valid`,
    }, null);

    return this;
  }

  /**
   * @param {String} key
   * @param {Number} timeout
   * @param {Function} callback
   * @returns {RedisNegativeMock}
   */
  del(key, timeout, callback) {
    callback({
      code: 404,
      message: `Element with ${key} was not found`,
    }, null);

    return this;
  }

  /**
   * @param {Function} callback
   * @returns {RedisNegativeMock}
   */
  flushall(callback) {
    callback({code: 500, message: `Internal error`}, null);

    return this;
  }
}

class RedisPositiveMock extends Redis {
  /**
   * @param args
   */
  constructor(...args) {
    super(args);
  }

  /**
   * @param {String} key
   * @param {Function} callback
   * @returns {RedisPositiveMock}
   */
  exists(key, callback) {
    callback(null, {key: 'data'});

    return this;
  }

  /**
   * @param {String} key
   * @param {Function} callback
   * @returns {RedisPositiveMock}
   */
  get(key, callback) {
    callback(null, {key: 'data'});

    return this;
  }

  /**
   * @param {String} key
   * @param {*} value
   * @param {Number} ttl
   * @param {Function} callback
   * @returns {RedisPositiveMock}
   */
  set(key, value, ttl, callback) {
    callback(null, {key: 'data'});

    return this;
  }

  /**
   * @param {String} key
   * @param {Number} timeout
   * @param {Function} callback
   * @returns {RedisPositiveMock}
   */
  del(key, timeout, callback) {
    callback(null, {key: 'data'});

    return this;
  }

  /**
   * @param {Function} callback
   * @returns {RedisPositiveMock}
   */
  flushall(callback) {
    callback(null, {key: 'data'});

    return this;
  }
}

class RedisDriverNegativeTest extends RedisDriver {
  /**
   * @param args
   */
  constructor(...args) {
    super(args);
  }

  /**
   * @constructor
   */
  get NATIVE_DRIVER() {
    return RedisNegativeMock;
  }
}

class RedisDriverPositiveTest extends RedisDriver {
  /**
   * @param args
   */
  constructor(...args) {
    super(args);
  }

  /**
   * @constructor
   */
  get NATIVE_DRIVER() {
    return RedisPositiveMock;
  }
}

suite('Driver/RedisDriver', function() {
  let redisDriver = new RedisDriver();
  let key = 'test_key';
  let value = 'test_value';
  let ttl = 1;
  let timeout = 1;

  test('Class RedisDriver exists in Driver/RedisDriver', function() {
    chai.expect(typeof RedisDriver).to.equal('function');
  });

  test('Check constructor sets by default _client', function() {
    chai.assert.instanceOf(redisDriver.client, Redis,
      'redisDriver.client is an instance of Redis');
  });

  test('Check _has() passes "RedisClusterException" exception in callback',
    function() {
      let redisDriverWrapper = new RedisDriverNegativeTest();
      let spyCallback = sinon.spy();
      redisDriverWrapper._has(key, spyCallback);
      chai.expect(spyCallback).to.have.been.calledWith();
      chai.assert.instanceOf(spyCallback.args[0][0],
        RedisClusterException,
        '_has() throws an instance of RedisClusterException');
    }
  );

  test('Check _get() passes "RedisClusterException" exception in callback',
    function() {
      let redisDriverWrapper = new RedisDriverNegativeTest();
      let spyCallback = sinon.spy();
      redisDriverWrapper._get(key, spyCallback);
      chai.expect(spyCallback).to.have.been.calledWith();
      chai.assert.instanceOf(spyCallback.args[0][0], RedisClusterException,
        '_get() throws an instance of RedisClusterException');
    }
  );

  test('Check _set() passes "RedisClusterException" in callback',
    function() {
      let redisDriverWrapper = new RedisDriverNegativeTest();
      let spyCallback = sinon.spy();
      redisDriverWrapper._set(key, value, ttl, spyCallback);
      chai.expect(spyCallback).to.have.been.calledWith();
      chai.assert.instanceOf(spyCallback.args[0][0], RedisClusterException,
        '_set() throws an instance of RedisClusterException');
    }
  );

  test('Check _invalidate() passes "RedisClusterException" in callback',
    function() {
      let redisDriverWrapper = new RedisDriverNegativeTest();
      let spyCallback = sinon.spy();
      redisDriverWrapper._invalidate(key, timeout, spyCallback);
      chai.expect(spyCallback).to.have.been.calledWith();
      chai.assert.instanceOf(spyCallback.args[0][0], RedisClusterException,
        '_invalidate() throws an instance of RedisClusterException');
    }
  );

  test('Check _flush() passes "RedisClusterException" in callback',
    function() {
      let redisDriverWrapper = new RedisDriverNegativeTest();
      let spyCallback = sinon.spy();
      redisDriverWrapper._flush(spyCallback);
      chai.expect(spyCallback).to.have.been.calledWith();
      chai.assert.instanceOf(spyCallback.args[0][0], RedisClusterException,
        '_invalidate() throws an instance of RedisClusterException');
    }
  );

  test('Check _has() passes result in callback',
    function() {
      let redisDriverWrapper = new RedisDriverPositiveTest();
      let spyCallback = sinon.spy();
      redisDriverWrapper._has(key, spyCallback);
      chai.expect(spyCallback).to.have.been.calledWithExactly(null, {key: 'data'});
    }
  );

  test('Check _get() passes result in callback',
    function() {
      let redisDriverWrapper = new RedisDriverPositiveTest();
      let spyCallback = sinon.spy();
      redisDriverWrapper._get(key, spyCallback);
      chai.expect(spyCallback).to.have.been.calledWithExactly(null, {key: 'data'});
    }
  );

  test('Check _set() passes result in callback',
    function() {
      let redisDriverWrapper = new RedisDriverPositiveTest();
      let spyCallback = sinon.spy();
      redisDriverWrapper._set(key, value, ttl, spyCallback);
      chai.expect(spyCallback).to.have.been.calledWithExactly(null, true);
    }
  );

  test('Check _invalidate() passes result in callback',
    function() {
      let redisDriverWrapper = new RedisDriverPositiveTest();
      let spyCallback = sinon.spy();
      redisDriverWrapper._invalidate(key, timeout, spyCallback);
      chai.expect(spyCallback).to.have.been.calledWithExactly(null, true);
    }
  );

  test('Check _flush() passes result in callback',
    function() {
      let redisDriverWrapper = new RedisDriverPositiveTest();
      let spyCallback = sinon.spy();
      redisDriverWrapper._flush(spyCallback);
      chai.expect(spyCallback).to.have.been.calledWithExactly(null, true);
    }
  );
});