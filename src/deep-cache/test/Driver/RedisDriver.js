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
        return callback({code: 404, message: `Element with ${key} was not found`});
      },
      get: function(key, callback) {
        return callback({code: 404, message: `Element with ${key} was not found`});
      },
      set: function(key, value, ttl, callback) {
        return callback({code: 400, message: `Key: ${key} or value: ${value} is not valid`});
      },
      del: function(key, timeout, callback) {
        return callback({code: 404, message: `Element with ${key} was not found`});
      },
      flushall: function(callback) {
        return callback({code: 500, message: `Internal error`});
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
    chai.assert.instanceOf(redisDriver.client, Redis, 'redisDriver.client is an instance of Redis');
  });

  test('Check _has() method throws "RedisClusterException" exception and doesn\'t call callback', function() {
    let redisDriverWrapper = new RedisDriverNegativeTest();
    let error = null;
    let spyCallback = sinon.spy();
    try {
      redisDriverWrapper._has(key, spyCallback);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
    chai.assert.instanceOf(error, RedisClusterException, '_has() throws an instance of RedisClusterException');
    chai.expect(spyCallback).to.not.have.been.called;
  });

  test('Check _get() method throws "RedisClusterException" exception and doesn\'t call callback', function() {
    let redisDriverWrapper = new RedisDriverNegativeTest();
    let error = null;
    let spyCallback = sinon.spy();
    try {
      redisDriverWrapper._get(key, spyCallback);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
    chai.assert.instanceOf(error, RedisClusterException, '_get() throws an instance of RedisClusterException');
    chai.expect(spyCallback).to.not.have.been.called;
  });

  test('Check _set() method throws "RedisClusterException" exception and doesn\'t call callback', function() {
    let redisDriverWrapper = new RedisDriverNegativeTest();
    let error = null;
    let spyCallback = sinon.spy();
    try {
      redisDriverWrapper._set(key, value, ttl, spyCallback);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
    chai.assert.instanceOf(error, RedisClusterException, '_set() throws an instance of RedisClusterException');
    chai.expect(spyCallback).to.not.have.been.called;
  });

  test('Check _invalidate() method throws "RedisClusterException" exception and doesn\'t call callback', function() {
    let redisDriverWrapper = new RedisDriverNegativeTest();
    let error = null;
    let spyCallback = sinon.spy();
    try {
      redisDriverWrapper._invalidate(key, timeout, spyCallback);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
    chai.assert.instanceOf(error, RedisClusterException, '_invalidate() throws an instance of RedisClusterException');
    chai.expect(spyCallback).to.not.have.been.called;
  });

  test('Check _flush() method throws "RedisClusterException" exception and doesn\'t call callback', function() {
    let redisDriverWrapper = new RedisDriverNegativeTest();
    let error = null;
    let spyCallback = sinon.spy();
    try {
      redisDriverWrapper._flush(spyCallback);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
    chai.assert.instanceOf(error, RedisClusterException, '_flush() throws an instance of RedisClusterException');
    chai.expect(spyCallback).to.not.have.been.called;
  });

  test('Check _has() method executes without error and calls callback', function() {
    let redisDriverWrapper = new RedisDriverPositiveTest();
    let error = null;
    let spyCallback = sinon.spy();
    try {
      redisDriverWrapper._has(key, spyCallback);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
    chai.expect(spyCallback).to.have.been.called;
  });

  test('Check _get() method executes without error and calls callback', function() {
    let redisDriverWrapper = new RedisDriverPositiveTest();
    let error = null;
    let spyCallback = sinon.spy();
    try {
      redisDriverWrapper._get(key, spyCallback);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
    chai.expect(spyCallback).to.have.been.called;
  });

  test('Check _set() method executes without error and calls callback', function() {
    let redisDriverWrapper = new RedisDriverPositiveTest();
    let error = null;
    let spyCallback = sinon.spy();
    try {
      redisDriverWrapper._set(key, value, ttl, spyCallback);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
    chai.expect(spyCallback).to.have.been.called;
  });

  test('Check _invalidate() method executes without error and calls callback', function() {
    let redisDriverWrapper = new RedisDriverPositiveTest();
    let error = null;
    let spyCallback = sinon.spy();
    try {
      redisDriverWrapper._invalidate(key, timeout, spyCallback);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
    chai.expect(spyCallback).to.have.been.called;
  });

  test('Check _flush() method executes without error and calls callback', function() {
    let redisDriverWrapper = new RedisDriverPositiveTest();
    let error = null;
    let spyCallback = sinon.spy();
    try {
      redisDriverWrapper._flush(spyCallback);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
    chai.expect(spyCallback).to.have.been.called;
  });
});