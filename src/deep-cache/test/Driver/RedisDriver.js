'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import Redis from 'ioredis';
import {RedisDriver} from '../../lib.compiled/Driver/RedisDriver';
import {RedisClusterException} from '../../lib.compiled/Driver/Exception/RedisClusterException';
chai.use(sinonChai);

class RedisDriverNegativeTest extends RedisDriver {
  constructor() {
    super();
    this._client = {
      exists: function(key, callback) {
        return callback({
          code: 404,
          message: `Element with ${key} was not found`,
        }, null);
      },
      get: function(key, callback) {
        return callback({
          code: 404,
          message: `Element with ${key} was not found`,
        }, null);
      },
      set: function(key, value, ttl, callback) {
        return callback({
          code: 400,
          message: `Key: ${key} or value: ${value} is not valid`,
        }, null);
      },
      del: function(key, timeout, callback) {
        return callback({
          code: 404,
          message: `Element with ${key} was not found`,
        }, null);
      },
      flushall: function(callback) {
        return callback({code: 500, message: `Internal error`}, null);
      },
    };
  }
}

class RedisDriverPositiveTest extends RedisDriver {
  constructor() {
    super();
    this._client = {
      exists: function(key, callback) {
        return callback(null, {key: 'data'});
      },
      get: function(key, callback) {
        return callback(null, {key: 'data'});
      },
      set: function(key, value, ttl, callback) {
        return callback(null, {key: 'data'});
      },
      del: function(key, timeout, callback) {
        return callback(null, {key: 'data'});
      },
      flushall: function(callback) {
        return callback(null, {key: 'data'});
      },
    };
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

  test('Check _has() passes "RedisClusterException" in callback',
    function() {
      let redisDriverWrapper = new RedisDriverPositiveTest();
      let spyCallback = sinon.spy();
      redisDriverWrapper._has(key, spyCallback);
      chai.expect(spyCallback).to.have.been.calledWith();
    }
  );

  test('Check _get() passes "RedisClusterException" in callback',
    function() {
      let redisDriverWrapper = new RedisDriverPositiveTest();
      let spyCallback = sinon.spy();
      redisDriverWrapper._get(key, spyCallback);
      chai.expect(spyCallback).to.have.been.calledWith();
    }
  );

  test('Check _set() passes "RedisClusterException" in callback',
    function() {
      let redisDriverWrapper = new RedisDriverPositiveTest();
      let spyCallback = sinon.spy();
      redisDriverWrapper._set(key, value, ttl, spyCallback);
      chai.expect(spyCallback).to.have.been.called;
    }
  );

  test('Check _invalidate() passes "RedisClusterException" in callback',
    function() {
      let redisDriverWrapper = new RedisDriverPositiveTest();
      let spyCallback = sinon.spy();
      redisDriverWrapper._invalidate(key, timeout, spyCallback);
      chai.expect(spyCallback).to.have.been.called;
    }
  );

  test('Check _flush() passes "RedisClusterException" in callback',
    function() {
      let redisDriverWrapper = new RedisDriverPositiveTest();
      let spyCallback = sinon.spy();
      redisDriverWrapper._flush(spyCallback);
      chai.expect(spyCallback).to.have.been.called;
    }
  );
});
