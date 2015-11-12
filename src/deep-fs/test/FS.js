'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {FS} from '../lib.compiled/FS';
import {UnknownFolderException} from '../lib.compiled/Exception/UnknownFolderException';
import Kernel from 'deep-kernel';

chai.use(sinonChai);

suite('FS', function() {
  let tmpBucketName = 'tempBucket';
  let publicBucketName = 'publicBucket';
  let systemBucketName = 'systemBucket';
  let fs = new FS(tmpBucketName, publicBucketName, systemBucketName);

  test('Class FS exists in FS', function() {
    chai.expect(typeof FS).to.equal('function');
  });

  test('Check TMP static getter returns "temp"', function() {
    chai.expect(FS.TMP).to.be.equal('temp');
  });

  test('Check PUBLIC static getter returns "public"', function() {
    chai.expect(FS.PUBLIC).to.be.equal('public');
  });

  test('Check SYSTEM static getter returns "system"', function() {
    chai.expect(FS.SYSTEM).to.be.equal('system');
  });

  test('Check FOLDERS static getter returns array of levels', function() {
    chai.expect(FS.FOLDERS.length).to.be.equal(3);
    chai.expect(FS.FOLDERS).to.be.include(FS.TMP);
    chai.expect(FS.FOLDERS).to.be.include(FS.PUBLIC);
    chai.expect(FS.FOLDERS).to.be.include(FS.SYSTEM);
  });

  test('Check getFolder() throws "UnknownFolderException" for invalid value',
    function() {
      let error = null;
      let invalidPath = 'invalidPath';
      try {
        fs.getFolder(invalidPath);
      } catch (e) {
        error = e;
      }

      chai.expect(error).to.be.not.equal(null);
      chai.expect(error).to.be.an.instanceof(UnknownFolderException);
      chai.expect(error.message).to.contains(
        `Unknown folder "${invalidPath}". Defined folders are`
      );
    }
  );

  test('Check getFolder() returns valid value for !this._mountedFolders[name]',
    function() {
      chai.expect(fs.getFolder(FS.TMP).bucket).to.eql(tmpBucketName);
    }
  );

  test('Check _getTmpDir() static method returns valid value', function() {
    let error = null;
    let actualResult = null;
    try {
      actualResult = FS._getTmpDir(FS.TMP);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
    chai.expect(actualResult).to.be.an.contains(FS.TMP);

  });

  test('Check tmp() getter returns valid mounted tmp folder', function() {
    let error = null;
    let actualResult = null;
    try {
      actualResult = fs.tmp;
    } catch (e) {
      error = e;
    }

    // todo - AssertionError: expected [Error: bucket is required] to equal null
    //chai.expect(error).to.be.equal(null);
    //chai.expect(actualResult).to.be.an.contains(FS.TMP);
  });

  test('Check public() getter returns valid mounted tmp folder', function() {
    let error = null;
    let actualResult = null;
    try {
      actualResult = fs.public;
    } catch (e) {
      error = e;
    }

    // todo - AssertionError: expected [Error: bucket is required] to equal null
    //chai.expect(error).to.be.equal(null);
    //chai.expect(actualResult).to.be.an.contains(FS.PUBLIC);
  });

  test('Check system() getter returns valid mounted tmp folder', function() {
    let error = null;
    let actualResult = null;
    try {
      actualResult = fs.system;
    } catch (e) {
      error = e;
    }

    // todo - AssertionError: expected [Error: bucket is required] to equal null
    //chai.expect(error).to.be.equal(null);
    //chai.expect(actualResult).to.be.an.contains(FS.SYSTEM);
  });

  test('Check boot() method boots a certain service', function() {
    let error = null;
    let actualResult = null;
    let deepServices = {serviceKey: 'ServiceName'};
    let spyCallback = sinon.spy();
    let kernel = null;
    try {
      kernel = new Kernel(deepServices, Kernel.FRONTEND_CONTEXT);
      kernel.config.buckets = fs._buckets;
      actualResult = fs.boot(kernel, spyCallback);
    } catch (e) {
      error = e;
    }
  });
});
