'use strict';

import chai from 'chai';
import path from 'path';
import {Registry} from '../lib/Registry';

suite('Registry', function() {
  let storage = {};
  let triggerError = false;

  function s3Key(bucket, key) {
    return `s3://${bucket}/${key}`;
  }

  let s3Mock = {
    getObject: (payload, cb) => {
      if (triggerError) {
        cb(new Error('Error on getObject()'), null);
        return;
      }

      let key = s3Key(payload.Bucket, payload.Key);

      if (storage.hasOwnProperty(key)) {
        let val = storage[key];

        if (payload.IfModifiedSince &&
          val.m.getTime() <= payload.IfModifiedSince.getTime()) {

          cb(null, null);
          return;
        }

        cb(null, {Body: val.b, LastModified: val.m});
        return;
      }

      let error = new Error('Key not found');
      error.code = 'NoSuchKey';

      cb(error, null);
    },
    putObject: (payload, cb) => {
      if (triggerError) {
        cb(new Error('Error on getObject()'), null);
        return;
      } else if (typeof payload.Body !== 'string') {
        cb(new Error(`Payload must be a string, ${typeof payload.Body} given!`), null);
        return;
      }

      let key = s3Key(payload.Bucket, payload.Key);

      storage[key] = {
        b: payload.Body,
        m: new Date(),
      };

      cb(null, {});
    }
  };

  let registry = new Registry(s3Mock, 'test_bucket');

  test('Class Registry exists in Registry', () => {
    chai.expect(typeof Registry).to.equal('function');
  });

  test('Test Registry.createFromFS()', () => {
    let registryFS = Registry.createFromFS({
      s3: s3Mock,
      bucket: 'test_bucket',
      getPath: (key) => {
        return path.join('subpath', key);
      },
    });

    chai.expect(registryFS).to.be.an.instanceof(Registry);
    chai.expect(registryFS.ensureFresh).to.equal(Registry.ENSURE_FRESH);
    chai.expect(registryFS.s3).to.equal(s3Mock);
    chai.expect(registryFS.bucket).to.equal('test_bucket');
    chai.expect(registryFS.registryFile).to.equal(path.join('subpath', Registry.REGISTRY_FILE));
  });

  test('Test properties getters', () => {
    chai.expect(registry.ensureFresh).to.equal(Registry.ENSURE_FRESH);
    chai.expect(registry.s3).to.equal(s3Mock);
    chai.expect(registry.bucket).to.equal('test_bucket');
    chai.expect(registry.registryFile).to.equal(Registry.REGISTRY_FILE);
  });

  test('Test write() method @OK', () => {
    registry.write('key1', 'test data', (error) => {
      chai.expect(error).to.equal(null);
    });

    registry.write('key_xxx', 'test data xxx', (error) => {
      chai.expect(error).to.equal(null);
    });

    chai.expect(registry._registry).to.deep.equal({'key1': 'test data', 'key_xxx': 'test data xxx'});
  });

  test('Test write() method @FAIL', () => {
    triggerError = true;

    registry.write('key1', 'test data', (error) => {
      chai.expect(error).to.be.an.instanceof(Error);
    });

    triggerError = false;
  });

  test('Test keys() method @OK', () => {
    registry.keys((error, keys) => {
      chai.expect(error).to.equal(null);
      chai.expect(keys).to.deep.equal(['key1', 'key_xxx']);
    });
  });

  test('Test keys() method @FAIL', () => {
    triggerError = true;

    registry.keys((error, keys) => {
      chai.expect(error).to.be.an.instanceof(Error);
      chai.expect(keys).to.equal(null);
    });

    triggerError = false;
  });

  test('Test exists() method @OK', () => {
    registry.exists('key1', (error, result) => {
      chai.expect(error).to.equal(null);
      chai.expect(result).to.equal(true);
    });

    registry.exists('key2', (error, result) => {
      chai.expect(error).to.equal(null);
      chai.expect(result).to.equal(false);
    });
  });

  test('Test exists() method @FAIL', () => {
    triggerError = true;

    registry.exists('key1', (error, result) => {
      chai.expect(error).to.be.an.instanceof(Error);
      chai.expect(result).to.equal(null);
    });

    triggerError = false;
  });

  test('Test read() method @OK', () => {
    registry.read('key1', (error, value) => {
      chai.expect(error).to.equal(null);
      chai.expect(value).to.equal('test data');
    });

    registry.read('key2', (error, value) => {
      chai.expect(error).to.be.an.instanceof(Error);
      chai.expect(value).to.equal(null);
    });
  });

  test('Test read() method @FAIL', () => {
    triggerError = true;

    registry.read('key1', (error, value) => {
      chai.expect(error).to.be.an.instanceof(Error);
      chai.expect(value).to.equal(null);
    });

    triggerError = false;
  });

  test('Test refresh() method @OK', () => {
    registry.refresh((error) => {
      chai.expect(error).to.equal(null);
    });
  });

  test('Test refresh() method @FAIL', () => {
    triggerError = true;

    registry.refresh((error) => {
      chai.expect(error).to.be.an.instanceof(Error);
    });

    triggerError = false;
  });
});
